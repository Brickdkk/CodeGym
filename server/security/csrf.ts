import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Stateless double-submit cookie CSRF protection.
 *
 * On every response we set a `csrf_token` cookie with a random value.
 * Mutating requests (POST/PUT/PATCH/DELETE) must echo that value back
 * in the `X-CSRF-Token` header. Because a cross-origin attacker cannot
 * read cookies from the target domain (SameSite=Lax + HttpOnly=false
 * so JS can read it), this provides CSRF protection without server state.
 *
 * No cookie-parser dependency — we parse cookies from the raw header.
 */

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const cookies: Record<string, string> = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      const key = pair.substring(0, idx).trim();
      const val = pair.substring(idx + 1).trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
}

/**
 * Middleware: set a csrf_token cookie on every response if not already present.
 */
export function provideCSRFToken(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req);
  if (!cookies['csrf_token']) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', token, {
      httpOnly: false, // JS must be able to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  next();
}

/**
 * Middleware: verify X-CSRF-Token header matches csrf_token cookie.
 * Only applied to mutating methods.
 */
export function verifyCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Safe methods don't need CSRF verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookies = parseCookies(req);
  const cookieToken = cookies['csrf_token'];
  const headerToken = req.headers['x-csrf-token'] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  next();
}
