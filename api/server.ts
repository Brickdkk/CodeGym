import type { VercelRequest, VercelResponse } from '@vercel/node';

// Diagnostic: test if the function itself works before loading app
let app: any = null;
let initializeApp: any = null;
let loadError: string | null = null;

try {
  // Use dynamic import to catch module-level errors
  // This is deferred to the first request rather than module evaluation
} catch (err: any) {
  loadError = err?.stack ?? String(err);
}

// Singleton initialization promise
let initialized: Promise<void> | null = null;

async function ensureInitialized() {
  if (!app) {
    // Dynamically import the app module — catches module-level throws
    const mod = await import('../server/app.js');
    app = mod.app;
    initializeApp = mod.initializeApp;
  }
  if (!initialized) {
    initialized = initializeApp().catch((err: any) => {
      initialized = null;
      throw err;
    });
  }
  return initialized;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (loadError) {
    res.status(500).json({ error: 'Module load error', details: loadError });
    return;
  }

  try {
    await ensureInitialized();
    app(req, res);
  } catch (err: any) {
    console.error('[api/server] Error:', err);
    res.status(500).json({
      error: 'Initialization failed',
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
  }
}
