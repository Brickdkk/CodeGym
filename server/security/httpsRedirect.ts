import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to force HTTPS connections
 * Redirects HTTP requests to HTTPS in production
 */
export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  // Check if request is secure or if we're in development
  if (req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'development') {
    return next();
  }

  // Redirect to HTTPS
  const httpsUrl = `https://${req.get('host')}${req.url}`;
  res.redirect(301, httpsUrl);
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict transport security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CSP is handled by Helmet in app.ts — do NOT set a duplicate here
  
  next();
}