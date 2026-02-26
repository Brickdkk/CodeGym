import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { log } from "./log.js";
import { storage } from "./storage.js";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import { initializePassport } from "./authStrategies.js";
import { pool } from "./db.js";
import { seedExercises } from "./seed/exercises.js";

// Security imports
import { enforceHTTPS, securityHeaders } from "./security/httpsRedirect.js";
import { apiRateLimit } from "./security/rateLimiting.js";
import { corsOptions } from "./security/corsConfig.js";

const app = express();

// ---- Middleware setup (synchronous) ----

// Security middleware - applied first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https:", "https://cdn.jsdelivr.net"],
      workerSrc: ["'self'", "blob:", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));
app.use(enforceHTTPS);
app.use(securityHeaders);
app.use(apiRateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes
app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ---- Async initialization ----

async function ensureDefaultLanguages() {
  const defaultLanguages = [
    {
      name: "Python",
      slug: "python",
      description: "Lenguaje de programación versátil y legible para desarrollo rápido.",
      icon: "python",
      color: "#3776AB",
      fileExtension: ".py",
      syntaxHighlighting: "python",
      defaultTemplate: "def main():\n    pass\n\nif __name__ == '__main__':\n    main()"
    },
    {
      name: "JavaScript",
      slug: "javascript",
      description: "Lenguaje esencial para desarrollo web y aplicaciones interactivas.",
      icon: "javascript",
      color: "#F7DF1E",
      fileExtension: ".js",
      syntaxHighlighting: "javascript",
      defaultTemplate: "function main() {\n  console.log('Hola CodeGym');\n}\n\nmain();"
    },
    {
      name: "C++",
      slug: "cpp",
      description: "Lenguaje de alto rendimiento orientado a objetos y sistemas.",
      icon: "cpp",
      color: "#00599C",
      fileExtension: ".cpp",
      syntaxHighlighting: "cpp",
      defaultTemplate: "#include <iostream>\n\nint main() {\n  std::cout << \"Hola CodeGym\\n\";\n  return 0;\n}"
    },
    {
      name: "C",
      slug: "c",
      description: "Lenguaje fundamental para sistemas y programación de bajo nivel.",
      icon: "c",
      color: "#A8B9CC",
      fileExtension: ".c",
      syntaxHighlighting: "c",
      defaultTemplate: "#include <stdio.h>\n\nint main() {\n  printf(\"Hola CodeGym\\n\");\n  return 0;\n}"
    },
    {
      name: "HTML & CSS",
      slug: "html-css",
      description: "Tecnologías base para estructuras y estilos en la web.",
      icon: "html",
      color: "#E44D26",
      fileExtension: ".html",
      syntaxHighlighting: "html",
      defaultTemplate: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Hola CodeGym</title>\n  <style>body { font-family: sans-serif; }</style>\n</head>\n<body>\n  <h1>Hola CodeGym</h1>\n</body>\n</html>"
    }
  ];

  for (const language of defaultLanguages) {
    const exists = await storage.getLanguageBySlug(language.slug);
    if (!exists) {
      await storage.createLanguage(language);
      console.log(`Language created: ${language.name}`);
    }
  }
}

async function ensureSessionStoreStructure() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL,
        PRIMARY KEY (sid)
      ) WITH (OIDS=FALSE);
    `);

    await client.query(
      'CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" (expire);'
    );
  } finally {
    client.release();
  }
}

/**
 * Initialize the Express app: session store, session middleware, passport,
 * routes, error handler, static serving. Must be called once before the
 * app can handle requests.
 */
export async function initializeApp() {
  // Configure passport strategies (deferred from module level to reduce cold-start weight)
  initializePassport();

  // Ensure session table exists
  await ensureSessionStoreStructure();

  // Session configuration
  const PgStore = connectPgSimple(session);

  app.use(session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'a-very-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  }));

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date(),
      environment: process.env.NODE_ENV
    });
  });

  // Compatibilidad: redirigir /api/login a la ruta cliente /login
  app.get('/api/login', (_req, res) => {
    res.redirect('/login');
  });

  // API Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      date: new Date(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    });
  });

  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Register API routes
  await registerRoutes(app);

  // Ensure default languages exist
  try {
    await ensureDefaultLanguages();
    console.log('Default languages verified');
  } catch (error) {
    console.error('Error ensuring default languages:', error);
  }

  // Seed 80 curated exercises (skips existing)
  try {
    const inserted = await seedExercises();
    if (inserted > 0) {
      console.log(`Seeded ${inserted} new exercises`);
    } else {
      console.log('All exercises already seeded');
    }
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    const errorLog = {
      timestamp: new Date().toISOString(),
      status,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: _req.path,
      method: _req.method
    };
    
    console.error('Application error:', JSON.stringify(errorLog));

    res.status(status).json({ 
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  });

  // In production (non-Vercel), serve static files.
  // On Vercel, static files are served by the CDN — the function only handles /api routes.
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }
}

export { app };
