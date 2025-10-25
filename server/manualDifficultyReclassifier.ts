import { db } from "./db.js";
import { exercises } from "../shared/schema.js";
import { eq } from "drizzle-orm";

/**
 * Manual difficulty reclassifier with strict rules
 * Fixes incorrect classifications like "API = beginner"
 */
export class ManualDifficultyReclassifier {
  
  async reclassifyAllExercises(): Promise<{
    total: number;
    updated: number;
    errors: number;
  }> {
    console.log('🔄 RECLASIFICACIÓN MANUAL CON REGLAS ESTRICTAS');
    console.log('==============================================');
    
    const allExercises = await db.select().from(exercises);
    let updated = 0;
    let errors = 0;
    
    for (const exercise of allExercises) {
      try {
        const currentDifficulty = exercise.difficulty;
        const newDifficulty = this.classifyExerciseStrict(
          exercise.title,
          exercise.description
        );
        
        if (newDifficulty !== currentDifficulty) {
          await db
            .update(exercises)
            .set({ difficulty: newDifficulty })
            .where(eq(exercises.id, exercise.id));
          
          console.log(`✅ "${exercise.title}": ${currentDifficulty} → ${newDifficulty}`);
          updated++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing "${exercise.title}":`, error);
        errors++;
      }
    }
    
    console.log(`\n📊 Resumen de Reclasificación:`);
    console.log(`   Total ejercicios: ${allExercises.length}`);
    console.log(`   Actualizados: ${updated}`);
    console.log(`   Errores: ${errors}`);
    console.log(`   Sin cambios: ${allExercises.length - updated - errors}`);
    
    return {
      total: allExercises.length,
      updated,
      errors
    };
  }

  private classifyExerciseStrict(title: string, description: string): 'beginner' | 'intermediate' | 'advanced' {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    const combined = `${titleLower} ${descLower}`;

    // REGLAS ESTRICTAS - ADVANCED (avanzado)
    const advancedKeywords = [
      // APIs y servicios web
      'api', 'rest api', 'web api', 'restful', 'endpoint', 'json api',
      'microservicio', 'microservice', 'web service', 'service', 'servidor',
      
      // Bases de datos
      'database', 'sql', 'mysql', 'postgresql', 'mongodb', 'orm',
      'base de datos', 'consulta', 'query', 'crud',
      
      // Web y networking
      'web scraping', 'scraper', 'scraping', 'crawler', 'spider',
      'http', 'https', 'request', 'response', 'client', 'servidor',
      'network', 'networking', 'socket', 'tcp', 'udp',
      
      // Autenticación y seguridad
      'authentication', 'authorization', 'auth', 'login', 'jwt',
      'oauth', 'security', 'encryption', 'decrypt', 'hash',
      'password', 'token', 'session', 'cookie',
      
      // Frameworks y librerías
      'framework', 'library', 'react', 'angular', 'vue', 'express',
      'django', 'flask', 'spring', 'laravel', 'rails',
      
      // Algoritmos complejos
      'algorithm', 'optimization', 'performance', 'complexity',
      'machine learning', 'ai', 'neural', 'data mining',
      'graph', 'tree traversal', 'dynamic programming',
      
      // Concurrencia y threading
      'thread', 'threading', 'concurrent', 'parallel', 'async',
      'await', 'promise', 'future', 'synchronization',
      
      // Sistemas y arquitectura
      'design pattern', 'architecture', 'mvc', 'mvp', 'solid',
      'dependency injection', 'factory', 'observer', 'singleton',
      'deployment', 'docker', 'kubernetes', 'devops'
    ];

    // REGLAS ESTRICTAS - INTERMEDIATE (intermedio) - Incluye listas/arrays
    const intermediateKeywords = [
      // Funciones
      'function', 'función', 'method', 'método', 'parameter', 'parámetro',
      'return', 'callback', 'closure', 'scope',
      
      // Estructuras de datos - TODAS las listas son intermediate
      'array', 'list', 'lista', 'arreglo', 'vector', 'object', 'objeto', 
      'dictionary', 'map', 'set', 'stack', 'queue', 'linked list', 'hash table',
      'matriz', 'matrix', 'tupla', 'tuple',
      
      // Operaciones con listas
      'append', 'insert', 'remove', 'pop', 'index', 'slice',
      'sort', 'reverse', 'count', 'extend', 'length', 'len',
      'contar', 'buscar', 'ordenar', 'invertir',
      
      // Programación orientada a objetos
      'class', 'clase', 'inheritance', 'herencia', 'polymorphism',
      'encapsulation', 'abstraction', 'interface', 'abstract',
      
      // Manejo de datos
      'json', 'xml', 'csv', 'parsing', 'serialization',
      'file', 'archivo', 'read', 'write', 'stream',
      
      // Algoritmos básicos
      'sorting', 'ordenamiento', 'search', 'búsqueda', 'binary search',
      'recursion', 'recursión', 'iteration', 'loop optimization',
      'factorial', 'fibonacci', 'prime', 'primo', 'palindrom',
      
      // Validación y manejo de errores
      'validation', 'validación', 'error handling', 'exception',
      'try catch', 'throw', 'assert', 'test', 'unit test',
      
      // Strings avanzados y regex
      'regular expression', 'regex', 'pattern', 'string manipulation',
      'substring', 'replace', 'split', 'join', 'vocal', 'vowel',
      'anagram', 'character', 'word'
    ];

    // REGLAS ESTRICTAS - BEGINNER (principiante) - SOLO LO MÁS BÁSICO
    const beginnerKeywords = [
      // Operaciones aritméticas muy básicas
      'suma', 'resta', 'multiplicación', 'división', 'add', 'subtract',
      'multiply', 'divide', 'calculator', 'calculadora', 'área', 'area',
      
      // Variables y tipos básicos
      'variable', 'tipo', 'integer', 'string', 'float', 'edad', 'age',
      
      // Control de flujo MUY básico
      'if else', 'if elif else', 'par o impar', 'positivo negativo',
      'for range', 'while simple', 'tabla multiplicar',
      
      // Input/Output básico
      'input', 'print', 'hello world', 'hola mundo',
      
      // Ejercicios ultra simples
      'básico', 'simple', 'first', 'primero', 'nombre', 'name'
    ];

    // APLICAR REGLAS EN ORDEN DE PRIORIDAD

    // 1. ADVANCED - Si contiene cualquier keyword avanzado
    for (const keyword of advancedKeywords) {
      if (combined.includes(keyword)) {
        return 'advanced';
      }
    }

    // 2. INTERMEDIATE - Si contiene keywords intermedios
    for (const keyword of intermediateKeywords) {
      if (combined.includes(keyword)) {
        return 'intermediate';
      }
    }

    // 3. BEGINNER - Solo si contiene keywords explícitamente básicos
    for (const keyword of beginnerKeywords) {
      if (combined.includes(keyword)) {
        return 'beginner';
      }
    }

    // 4. DEFAULT - Si no es explícitamente básico, es intermedio por seguridad
    return 'intermediate';
  }

  async reclassifySpecificExercises(patterns: string[]): Promise<void> {
    console.log('🎯 RECLASIFICACIÓN ESPECÍFICA');
    console.log('============================');
    
    for (const pattern of patterns) {
      const exercisesToUpdate = await db
        .select()
        .from(exercises)
        .where(eq(exercises.title, pattern));
      
      for (const exercise of exercisesToUpdate) {
        const newDifficulty = this.classifyExerciseStrict(
          exercise.title,
          exercise.description
        );
        
        if (newDifficulty !== exercise.difficulty) {
          await db
            .update(exercises)
            .set({ difficulty: newDifficulty })
            .where(eq(exercises.id, exercise.id));
          
          console.log(`✅ "${exercise.title}": ${exercise.difficulty} → ${newDifficulty}`);
        }
      }
    }
  }
}

export const manualDifficultyReclassifier = new ManualDifficultyReclassifier();