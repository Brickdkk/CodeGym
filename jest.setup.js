// Jest setup file
// Configuración global para todas las pruebas

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SESSION_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/codegym_test';

// Mock console para tests más limpios (opcional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Aumentar timeout para pruebas que requieren setup de servidor
jest.setTimeout(15000);
