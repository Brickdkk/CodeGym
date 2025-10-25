import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// In-memory CSRF token store (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

/**
 * Generate CSRF token for session
 */
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (60 * 60 * 1000); // 1 hour
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Clean expired tokens
  for (const [key, value] of csrfTokens.entries()) {
    if (Date.now() > value.expires) {
      csrfTokens.delete(key);
    }
  }
  
  return token;
}

/**
 * Middleware to provide CSRF token
 */
export function provideCSRFToken(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.sessionID || req.ip || 'anonymous';
  const token = generateCSRFToken(sessionId);
  
  res.locals.csrfToken = token;
  res.setHeader('X-CSRF-Token', token);
  
  next();
}

/**
 * Middleware to verify CSRF token
 */
export function verifyCSRFToken(req: Request, res: Response, next: NextFunction) {
  // Skip verification for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const sessionId = req.sessionID || req.ip || 'anonymous';
  const providedToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  if (!providedToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  
  const storedData = csrfTokens.get(sessionId);
  
  if (!storedData) {
    return res.status(403).json({ error: 'Invalid session' });
  }
  
  if (Date.now() > storedData.expires) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({ error: 'CSRF token expired' });
  }
  
  if (storedData.token !== providedToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}