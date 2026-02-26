import { app, initializeApp } from "./app.js";
import { setupVite, log } from "./vite.js";
import { createServer } from "http";

(async () => {
  await initializeApp();

  const server = createServer(app);

  // In development, use Vite's dev server with HMR
  if (app.get("env") === "development") {
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, '127.0.0.1', () => {
    log(`serving on port ${port}`);
  });
})();
