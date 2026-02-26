/**
 * log.ts — Shared logging utility.
 *
 * Extracted from vite.ts so that server/app.ts (used by the Vercel
 * serverless function) can log without importing Vite and its heavy
 * dependency tree.
 */

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}
