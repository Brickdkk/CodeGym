import type { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiting store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting middleware for login attempts
 * Prevents brute force attacks
 */
export function loginRateLimit(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean expired entries
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    
    const entry = rateLimitStore.get(clientId);
    
    if (!entry) {
      // First attempt
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (now > entry.resetTime) {
      // Window expired, reset
      entry.count = 1;
      entry.resetTime = now + windowMs;
      return next();
    }
    
    if (entry.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
    
    entry.count++;
    next();
  };
}

/**
 * General API rate limiting
 */
export function apiRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `api_${clientId}`;
    
    // Clean expired entries
    for (const [entryKey, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime && entryKey.startsWith('api_')) {
        rateLimitStore.delete(entryKey);
      }
    }
    
    const entry = rateLimitStore.get(key);
    
    if (!entry) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
      return next();
    }
    
    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }
    
    entry.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    next();
  };
}