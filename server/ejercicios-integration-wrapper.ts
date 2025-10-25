/**
 * Wrapper seguro para el módulo de integración de ejercicios
 * Este archivo proporciona un manejo seguro de la importación del módulo ejercicios-integration.js
 * evitando errores fatales si el módulo no está disponible
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Definimos tipos para las funciones que esperamos importar
interface IntegracionEjercicios {
  integrarSistemaEjercicios: (app: any) => Promise<boolean>;
  conectarConCodeGym: (storage: any) => Promise<boolean>;
}

// Implementaciones fallback en caso de que falle la importación
const fallbackImplementation: IntegracionEjercicios = {
  integrarSistemaEjercicios: async (app: any) => {
    console.log('⚠️ Usando implementación fallback para integrarSistemaEjercicios');
    
    // Añadir una ruta básica para ejercicios
    if (app && typeof app.get === 'function') {
      app.get('/api/ejercicios/status', (req: any, res: any) => {
        res.json({ status: 'fallback', message: 'Sistema de ejercicios en modo básico' });
      });
    }
    
    return true;
  },
  conectarConCodeGym: async (storage: any) => {
    console.log('⚠️ Usando implementación fallback para conectarConCodeGym');
    console.log('ℹ️ Storage disponible:', !!storage);
    return true;
  }
};

// Función para intentar importar el módulo de manera segura
async function importarModuloSeguro(): Promise<IntegracionEjercicios> {
  try {    // Intento 1: Importación dinámica ES6
    try {
      // @ts-ignore - El módulo existe pero TypeScript no puede inferir sus tipos
      const modulo = await import('./ejercicios-integration.js');
      
      if (typeof modulo.integrarSistemaEjercicios === 'function' && 
          typeof modulo.conectarConCodeGym === 'function') {
        console.log('✅ Módulo ejercicios-integration.js cargado correctamente (ES6)');
        return modulo as IntegracionEjercicios;
      }
    } catch (esError) {
      console.log('⚠️ Importación ES6 falló, intentando CommonJS...');
    }
    
    // Intento 2: Require CommonJS
    try {
      const modulo = require('./ejercicios-integration.js');
      
      if (typeof modulo.integrarSistemaEjercicios === 'function' && 
          typeof modulo.conectarConCodeGym === 'function') {
        console.log('✅ Módulo ejercicios-integration.js cargado correctamente (CommonJS)');
        return modulo as IntegracionEjercicios;
      }
    } catch (cjsError) {
      console.log('⚠️ Importación CommonJS también falló');
    }
    
    console.warn('⚠️ El módulo ejercicios-integration.js no contiene las funciones esperadas');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('⚠️ No se pudo cargar el módulo ejercicios-integration.js:', errorMessage);
  }
  
  console.log('ℹ️ Usando implementaciones fallback para las funciones de integración');
  return fallbackImplementation;
}

// Inicializar el módulo
const implementacionPromise = importarModuloSeguro();

// Wrapper para integrarSistemaEjercicios
export async function integrarSistemaEjercicios(app: any): Promise<boolean> {
  try {
    const implementacion = await implementacionPromise;
    return await implementacion.integrarSistemaEjercicios(app);
  } catch (error) {
    console.error('Error en integrarSistemaEjercicios:', error);
    return await fallbackImplementation.integrarSistemaEjercicios(app);
  }
}

// Wrapper para conectarConCodeGym
export async function conectarConCodeGym(storage: any): Promise<boolean> {
  try {
    const implementacion = await implementacionPromise;
    return await implementacion.conectarConCodeGym(storage);
  } catch (error) {
    console.error('Error en conectarConCodeGym:', error);
    return await fallbackImplementation.conectarConCodeGym(storage);
  }
}
