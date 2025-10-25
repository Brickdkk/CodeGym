import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { integrarSistemaEjercicios, conectarConCodeGym } from "./ejercicios-integration-wrapper.js";
import { storage } from "./storage.js";
import { exerciseGenerator } from "./exerciseGenerator.js";
import type { InsertLanguage } from "../shared/schema.js";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import { initializePassport } from "./authStrategies.js";
import { pool } from "./db.js";

// Security imports
import { enforceHTTPS, securityHeaders } from "./security/httpsRedirect.js";
import { apiRateLimit } from "./security/rateLimiting.js";
import { corsOptions } from "./security/corsConfig.js";
import { securityLogger } from "./security/securityLogger.js";

const app = express();
initializePassport();

async function ensureDefaultLanguages() {
  const defaultLanguages: InsertLanguage[] = [
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
      name: "C#",
      slug: "csharp",
      description: "Lenguaje moderno para aplicaciones empresariales y juegos.",
      icon: "csharp",
      color: "#239120",
      fileExtension: ".cs",
      syntaxHighlighting: "csharp",
      defaultTemplate: "using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Hola CodeGym\");\n  }\n}"
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
      console.log(`✓ Lenguaje base creado: ${language.name}`);
    }
  }
}

// Security middleware - applied first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"],
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

// Session configuration
const PgStore = connectPgSimple(session);

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

await ensureSessionStoreStructure();

app.use(session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false, // Avoid duplicate index creation, migrations already manage this table
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET || 'a-very-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint para monitoreo en Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Compatibilidad: redirigir /api/login (usado por varios lugares del cliente)
// a la ruta cliente /login para evitar 404 cuando el cliente usa window.location.href = '/api/login'
app.get('/api/login', (_req, res) => {
  // En desarrollo Vite servirá el index.html; redirigimos a la ruta cliente
  res.redirect('/login');
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    date: new Date(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

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

(async () => {
  const server = await registerRoutes(app);

  // Integrar el microservicio de ejercicios
  try {
  await ensureDefaultLanguages();
  await integrarSistemaEjercicios(app);
    await conectarConCodeGym(storage);
    console.log('Microservicio de ejercicios integrado exitosamente');
    
    // Verificar ejercicios existentes y generar faltantes por lenguaje
    console.log('Verificando colección de ejercicios...');
    const exerciseStats = await storage.getStats();
    console.log(`Ejercicios disponibles: ${exerciseStats.exercisesSolved || 'verificando...'}`);

    const languages = await storage.getLanguages();
    let seededLanguages = 0;

    for (const lang of languages) {
      const existingExercises = await storage.getExercisesByLanguage(lang.slug);
      if (existingExercises.length === 0) {
        console.log(`[seed] ${lang.name} no tiene ejercicios registrados. Generando contenido inicial...`);
        await exerciseGenerator.generateExercisesForLanguage(lang.slug);
        seededLanguages += 1;
      }
    }

    if (seededLanguages === 0) {
      console.log('✓ Ejercicios disponibles en el sistema');
    } else {
      console.log(`✓ Se generaron ejercicios para ${seededLanguages} lenguaje(s) sin contenido previo`);
    }

    // Ajustes complementarios para mantener consistencia de datos
    try {
      const { fixExerciseDifficulties } = await import("./fixExerciseDifficulties.js");
      await fixExerciseDifficulties();
    } catch (error) {
      console.log('Note: Exercise difficulties already estandarizadas o no requerian cambios');
    }

    try {
      const { loadExercisesForCLanguages } = await import("./quickExerciseLoader.js");
      await loadExercisesForCLanguages();
    } catch (error) {
      console.log('Exercise loading completed or no additional C exercises required');
    }

    try {
      const { fixTerminalAndDifficulty } = await import("./fixTerminalAndDifficulty.js");
      await fixTerminalAndDifficulty();
    } catch (error) {
      console.log('Terminal and difficulty fixes already applied previamente');
    }
  } catch (error) {
    console.error('Error integrando microservicio de ejercicios:', error);
  }
  // Middleware de manejo de errores global mejorado
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Registro estructurado de errores
    const errorLog = {
      timestamp: new Date().toISOString(),
      status,
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: _req.path,
      method: _req.method
    };
    
    console.error('Error en la aplicación:', JSON.stringify(errorLog));

    // No exponemos detalles internos del error en producción
    res.status(status).json({ 
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  // ALWAYS serve the app on the configured port
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Bind to localhost to avoid unsupported host binding in some environments.
  // Avoid using reusePort here for local development.
  server.listen(port, '127.0.0.1', () => {
    log(`serving on port ${port}`);
  });
})();
