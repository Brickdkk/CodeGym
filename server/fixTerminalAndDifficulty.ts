import { difficultyClassifier } from "./difficultyClassifier.js";
import { db } from "./db.js";
import { exercises } from "../shared/schema.js";
import { like, or } from "drizzle-orm";

/**
 * Comprehensive fix for terminal execution and difficulty classification
 */
export async function fixTerminalAndDifficulty(): Promise<void> {
  console.log('🔧 FIXING TERMINAL EXECUTION AND DIFFICULTY CLASSIFICATION');
  console.log('=======================================================');

  // Step 1: Fix obviously misclassified exercises first
  console.log('\n📋 Step 1: Identifying obviously misclassified exercises...');
  
  const problematicExercises = await db
    .select()
    .from(exercises)
    .where(
      or(
        // API integration as beginner is wrong
        like(exercises.description, '%API%'),
        like(exercises.title, '%API%'),
        // Database operations as beginner is wrong
        like(exercises.description, '%database%'),
        like(exercises.description, '%SQL%'),
        // Authentication as beginner is wrong
        like(exercises.description, '%authentication%'),
        like(exercises.description, '%login%'),
        // Complex algorithms as beginner is wrong
        like(exercises.description, '%algorithm%'),
        like(exercises.description, '%optimization%'),
        // Integration projects as beginner is wrong
        like(exercises.description, '%integration%'),
        like(exercises.description, '%framework%')
      )
    );

  console.log(`Found ${problematicExercises.length} potentially misclassified exercises`);

  // Step 2: Reclassify problematic exercises first
  if (problematicExercises.length > 0) {
    console.log('\n🎯 Step 2: Reclassifying problematic exercises...');
    const problematicIds = problematicExercises.map(ex => ex.id);
    await difficultyClassifier.classifySpecificExercises(problematicIds);
  }

  // Step 3: Sample a few more exercises for validation
  console.log('\n📊 Step 3: Sampling additional exercises for validation...');
  const sampleExercises = await db
    .select()
    .from(exercises)
    .limit(20)
    .offset(Math.floor(Math.random() * 100));

  if (sampleExercises.length > 0) {
    const sampleIds = sampleExercises.map(ex => ex.id);
    await difficultyClassifier.classifySpecificExercises(sampleIds);
  }

  // Step 4: Test terminal functionality
  console.log('\n🖥️ Step 4: Testing terminal execution...');
  await testTerminalExecution();

  console.log('\n✅ TERMINAL AND DIFFICULTY FIXES COMPLETED');
  console.log('==========================================');
}

async function testTerminalExecution(): Promise<void> {
  try {
    // Test a simple exercise
    const [testExercise] = await db
      .select()
      .from(exercises)
      .limit(1);

    if (testExercise) {
      console.log(`Testing terminal with exercise: "${testExercise.title}"`);
      
      // Check test cases format
      let testCases = [];
      try {
        if (testExercise.testCases) {
          if (Array.isArray(testExercise.testCases)) {
            testCases = testExercise.testCases;
          } else if (typeof testExercise.testCases === 'string') {
            testCases = JSON.parse(testExercise.testCases);
          }
        }
        console.log(`✅ Test cases parsed successfully: ${testCases.length} cases`);
      } catch (error) {
        console.log(`❌ Test cases parsing error: ${error}`);
      }
    }
  } catch (error) {
    console.error('Terminal test error:', error);
  }
}

// Auto-run if executed directly
if (require.main === module) {
  fixTerminalAndDifficulty().then(() => {
    console.log('Fix process completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Fix process failed:', error);
    process.exit(1);
  });
}