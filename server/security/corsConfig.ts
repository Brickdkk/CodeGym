import type { CorsOptions } from 'cors';

/**
 * CORS configuration for production security
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);    // Define allowed origins
    const allowedOrigins = [
      'https://codegym.cl',
      'https://www.codegym.cl',
      'https://codegym-ejerciciosdeprogramacion.onrender.com',
      process.env.REPLIT_DOMAINS?.split(',').map(domain => `https://${domain}`) || [],
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5000', 'http://127.0.0.1:5000'] : [])
    ].flat();

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  exposedHeaders: [
    'X-CSRF-Token',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400 // 24 hours
};