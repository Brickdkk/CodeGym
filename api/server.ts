import type { VercelRequest, VercelResponse } from '@vercel/node';

// Phase 1: Test if the function runtime works at all
let app: any = null;
let initializeApp: any = null;
let loadError: string | null = null;
let initialized: Promise<void> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // If first request, dynamically import the app
  if (!app && !loadError) {
    try {
      const mod = await import('../server/app.js');
      app = mod.app;
      initializeApp = mod.initializeApp;
    } catch (err: any) {
      loadError = err?.stack ?? String(err);
      console.error('[api/server] Import error:', err);
    }
  }

  if (loadError) {
    res.status(500).json({ error: 'Module import failed', details: loadError });
    return;
  }

  if (!initialized) {
    try {
      initialized = initializeApp();
      await initialized;
    } catch (err: any) {
      initialized = null;
      console.error('[api/server] Init error:', err);
      res.status(500).json({
        error: 'Initialization failed',
        message: err?.message ?? String(err),
        stack: err?.stack,
      });
      return;
    }
  } else {
    await initialized;
  }

  app(req, res);
}
