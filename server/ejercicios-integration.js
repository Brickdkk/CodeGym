/**
 * Integración principal del sistema de ejercicios con CodeGym
 */

import { autoLoader } from './ejercicios-autoloader.js';
import configurarRutasEjercicios from './ejercicios-routes.js';
import { storage as ejerciciosStorage } from './ejercicios-storage.js';

export async function integrarSistemaEjercicios(app) {
  console.log('Iniciando integración del sistema de ejercicios...');
  
  try {
    // Configurar rutas API
    configurarRutasEjercicios(app);
    
    // Cargar ejercicios iniciales si no existen
    await autoLoader.cargarEjerciciosIniciales();
    
    console.log('Sistema de ejercicios integrado exitosamente');
    return true;
    
  } catch (error) {
    console.error('Error integrando sistema de ejercicios:', error);
    throw error;
  }
}

// Función para conectar con CodeGym existente
export async function conectarConCodeGym(storage) {
  console.log('Conectando microservicio con CodeGym existente...');
  
  try {
    // Sincronizar datos existentes de CodeGym
    const ejerciciosCodeGym = await storage.getAllExercises();
    const lenguajesCodeGym = await storage.getLanguages();
    
    console.log(`Encontrados ${ejerciciosCodeGym.length} ejercicios en CodeGym`);
    console.log(`Encontrados ${lenguajesCodeGym.length} lenguajes en CodeGym`);
    
    // Transformar y cargar ejercicios existentes al microservicio
    for (const ejercicio of ejerciciosCodeGym) {
      try {
        const ejercicioTransformado = transformarDeCodeGym(ejercicio);
        await ejerciciosStorage.agregarEjercicio(ejercicioTransformado);
      } catch (error) {
        console.error(`Error transformando ejercicio ${ejercicio.title}:`, error.message);
      }
    }
    
    console.log('Sincronización con CodeGym completada');
    return {
      ejerciciosSincronizados: ejerciciosCodeGym.length,
      lenguajesDisponibles: lenguajesCodeGym.length
    };
    
  } catch (error) {
    console.error('Error conectando con CodeGym:', error);
    return null;
  }
}

// Transformar ejercicio de formato CodeGym a microservicio
function transformarDeCodeGym(ejercicioCodeGym) {
  return {
    id: ejercicioCodeGym.slug,
    titulo: ejercicioCodeGym.title,
    descripcion: ejercicioCodeGym.description,
    lenguaje: mapearLenguajeCodeGym(ejercicioCodeGym.languageId),
    nivel: mapearDificultadCodeGym(ejercicioCodeGym.difficulty),
    codigo_inicial: ejercicioCodeGym.starterCode || '',
    solucion: ejercicioCodeGym.solution || '',
    casos_prueba: ejercicioCodeGym.testCases ? 
      (typeof ejercicioCodeGym.testCases === 'string' ? JSON.parse(ejercicioCodeGym.testCases) : ejercicioCodeGym.testCases) : [],
    tags: ejercicioCodeGym.tags ? 
      (typeof ejercicioCodeGym.tags === 'string' ? JSON.parse(ejercicioCodeGym.tags) : ejercicioCodeGym.tags) : [],
    puntos: ejercicioCodeGym.points || 10,
    tiempo_limite: ejercicioCodeGym.timeLimit || 5000,
    memoria_limite: ejercicioCodeGym.memoryLimit || 128,
    categoria: 'general',
    autor: 'CodeGym',
    fecha_creacion: ejercicioCodeGym.createdAt || new Date(),
    activo: ejercicioCodeGym.isActive !== false
  };
}

function mapearLenguajeCodeGym(languageId) {
  const mapa = {
    1: 'python',
    2: 'javascript', 
    3: 'java',
    4: 'cpp',
    5: 'c',
    6: 'csharp'
  };
  return mapa[languageId] || 'python';
}

function mapearDificultadCodeGym(difficulty) {
  const mapa = {
    'beginner': 'principiante',
    'intermediate': 'intermedio', 
    'advanced': 'avanzado',
    'expert': 'avanzado'
  };
  return mapa[difficulty] || 'principiante';
}

export default integrarSistemaEjercicios;