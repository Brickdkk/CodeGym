import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

// Compatibility helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true, // Forzar tipo para evitar error de TS
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  let distPath;
    if (process.env.NODE_ENV === 'production') {
    // Intentamos varias ubicaciones posibles donde podrían estar los archivos estáticos
    
    // 1. Ubicación relativa al script compilado
    distPath = path.resolve(__dirname, "../client");
    
    // 2. Si no existe, probamos con la ubicación relativa a la raíz del proyecto
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      distPath = path.resolve(process.cwd(), 'dist/client');
      
      // 3. Si aún no existe, intentamos la ubicación absoluta en Render
      if (!fs.existsSync(path.join(distPath, "index.html"))) {
        distPath = path.resolve(process.cwd(), 'client/dist');
        
        // 4. Última opción: estructura de Render
        if (!fs.existsSync(path.join(distPath, "index.html"))) {
          distPath = path.resolve('/opt/render/project/src/dist/client');
        }
      }
    }
  } else {
    // En desarrollo, usamos la carpeta public
    distPath = path.resolve(__dirname, "public");
  }

  console.log(`Serving static files from: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Usar caché para archivos estáticos en producción
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 // Cache durante 1 día en producción
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
