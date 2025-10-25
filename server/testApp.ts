import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

/**
 * Crea una instancia de la aplicación Express para testing
 * Esta función crea una versión simplificada de la app principal
 * sin conectar a base de datos ni otros servicios externos
 */
export async function createTestApp(): Promise<express.Application> {
  const app = express();

  // Security middleware básico para tests
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));

  app.use(cors());
  app.use(compression());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Health check endpoints
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'test'
    });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      date: new Date(),
      environment: process.env.NODE_ENV || 'test',
      version: '1.0.0'
    });
  });

  // Mock de algunos endpoints básicos para testing
  app.get('/api/exercises', (req, res) => {
    res.status(200).json({
      exercises: [],
      total: 0,
      message: 'Test endpoint'
    });
  });

  // Error handler para testing
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Test app error:', err);
    res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'test' ? err.message : 'Server Error'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      message: 'Endpoint not found',
      path: req.originalUrl
    });
  });

  return app;
}
