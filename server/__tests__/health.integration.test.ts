import request from 'supertest';
import express from 'express';
import { createTestApp } from '../testApp';

describe('API Health Endpoints - Pruebas de Integración', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Crear una instancia de la app para testing
    app = await createTestApp();
  });

  afterAll(async () => {
    // Cleanup si es necesario
    // Cerrar conexiones de base de datos, etc.
  });

  describe('GET /health', () => {
    test('debe retornar status 200 y estructura correcta', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        environment: expect.any(String)
      });
      expect(response.body.timestamp).toBeDefined();
    });

    test('debe retornar content-type JSON', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/health', () => {
    test('debe retornar status 200 con estructura de API health', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        environment: expect.any(String),
        version: expect.any(String)
      });
      expect(response.body.date).toBeDefined();
      
      // Verificar que la fecha es válida
      const date = new Date(response.body.date);
      expect(date.getTime()).not.toBeNaN();
    });

    test('debe completarse en menos de 1 segundo', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000);
    });

    test('debe manejar múltiples requests concurrentes', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/health')
          .expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('ok');
      });
    });
  });

  describe('Error Handling', () => {
    test('debe retornar 404 para rutas no existentes', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    // Se omite esta prueba porque superagent (cliente de prueba) es demasiado estricto
    // y falla antes de que la solicitud llegue al servidor.
    // El objetivo es probar la resiliencia del servidor, no del cliente.
    test.skip('debe manejar headers malformados', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('X-Invalid-Header', 'invalid value\r\n')
        .expect(200);

      // La app debe seguir funcionando a pesar del header malformado
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Security Headers', () => {
    test('debe incluir headers de seguridad básicos', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Verificar que incluye algunos headers de seguridad
      // Los headers exactos dependerán de la configuración de helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
