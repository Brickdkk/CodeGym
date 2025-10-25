import { difficultyClassifier } from "./difficultyClassifier.js";
import { db } from "./db.js";
import { exercises } from "../shared/schema.js";
import { like, or, eq } from "drizzle-orm";

/**
 * Immediate difficulty classification fix for obviously wrong exercises
 */
async function fixObviouslyWrongDifficulties(): Promise<void> {
  console.log('🎯 Fixing obviously misclassified exercises...');
  
  // Find exercises with API/integration/authentication marked as beginner
  const problematicExercises = await db
    .select()
    .from(exercises)
    .where(
      or(
        like(exercises.description, '%API%'),
        like(exercises.title, '%API%'),
        like(exercises.description, '%authentication%'),
        like(exercises.description, '%database%'),
        like(exercises.description, '%integration%'),
        like(exercises.description, '%server%'),
        like(exercises.description, '%framework%')
      )
    );

  console.log(`Found ${problematicExercises.length} potentially misclassified exercises`);

  // Fix the most obvious ones immediately
  for (const exercise of problematicExercises.slice(0, 10)) {
    const content = (exercise.title + ' ' + exercise.description).toLowerCase();
    
    let newDifficulty = exercise.difficulty;
    
    if (content.includes('api') || content.includes('authentication') || content.includes('database')) {
      newDifficulty = 'advanced';
    } else if (content.includes('integration') || content.includes('server')) {
      newDifficulty = 'intermediate';
    }
    
    if (newDifficulty !== exercise.difficulty) {
      await db
        .update(exercises)
        .set({ difficulty: newDifficulty })
        .where(eq(exercises.id, exercise.id));
      
      console.log(`Fixed: "${exercise.title}" ${exercise.difficulty} → ${newDifficulty}`);
    }
  }
}

// Auto-run
fixObviouslyWrongDifficulties().then(() => {
  console.log('Quick difficulty fixes completed');
}).catch(console.error);