import { db } from "./db.js";
import { exercises } from "../shared/schema.js";
import { eq } from "drizzle-orm";

/**
 * Fix exercise difficulties to match frontend expectations
 * Convert all difficulty values to standard format
 */
export async function fixExerciseDifficulties(): Promise<void> {
  console.log('🔧 Corrigiendo dificultades de ejercicios...');

  // Define the difficulty mapping
  const difficultyMap: Record<string, string> = {
    'easy': 'beginner',
    'basic': 'beginner', 
    'principiante': 'beginner',
    'beginner': 'beginner',
    
    'medium': 'intermediate',
    'intermedio': 'intermediate',
    'intermediate': 'intermediate',
    
    'hard': 'advanced',
    'avanzado': 'advanced',
    'advanced': 'advanced'
  };

  let updatedCount = 0;

  try {
    // Get all exercises with non-standard difficulties
    const allExercises = await db.select().from(exercises);
    
    for (const exercise of allExercises) {
      const currentDifficulty = exercise.difficulty?.toLowerCase();
      const standardDifficulty = difficultyMap[currentDifficulty];
      
      if (standardDifficulty && standardDifficulty !== exercise.difficulty) {
        await db
          .update(exercises)
          .set({ difficulty: standardDifficulty })
          .where(eq(exercises.id, exercise.id));
        
        updatedCount++;
      }
    }

    console.log(`✅ Actualizadas ${updatedCount} dificultades de ejercicios`);
    console.log('📊 Dificultades estándar: beginner, intermediate, advanced');

  } catch (error) {
    console.error('❌ Error al corregir dificultades:', error);
    throw error;
  }
}

// Auto-run if module is executed directly
if (require.main === module) {
  fixExerciseDifficulties().then(() => {
    console.log('Corrección de dificultades completada');
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}