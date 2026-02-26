import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app, initializeApp } from '../server/app.js';

// Singleton initialization promise — ensures initializeApp() runs exactly once
let initialized: Promise<void> | null = null;

function ensureInitialized() {
  if (!initialized) {
    initialized = initializeApp().catch((err) => {
      // Reset so next invocation retries
      initialized = null;
      throw err;
    });
  }
  return initialized;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureInitialized();
    app(req, res);
  } catch (err: any) {
    console.error('[api/server] Initialization error:', err);
    res.status(500).json({
      error: 'Initialization failed',
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
  }
}
