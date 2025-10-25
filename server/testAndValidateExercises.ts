import { db } from "./db.js";
import { exercises, languages } from "../shared/schema.js";
import { eq, sql } from "drizzle-orm";

/**
 * Comprehensive testing and validation of exercise system
 */
export async function runExerciseValidation(): Promise<void> {
  console.log('🔍 RUNNING COMPREHENSIVE EXERCISE VALIDATION');
  console.log('===========================================');

  // Test 1: Validate exercise counts per language
  console.log('\n📊 Testing exercise counts...');
  const languageList = await db.select().from(languages);
  
  for (const language of languageList) {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(exercises)
      .where(eq(exercises.languageId, language.id));
    
    const count = countResult?.count || 0;
    const status = count >= 100 ? '✅' : count >= 50 ? '⚠️' : '❌';
    console.log(`${status} ${language.name}: ${count} exercises`);
  }

  // Test 2: Validate difficulty distribution
  console.log('\n🎯 Testing difficulty distribution...');
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  
  for (const language of languageList.filter(l => ['c', 'cpp', 'csharp'].includes(l.slug))) {
    console.log(`\n${language.name} difficulty breakdown:`);
    
    for (const difficulty of difficulties) {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(exercises)
        .where(eq(exercises.languageId, language.id))
        .where(eq(exercises.difficulty, difficulty));
      
      const count = countResult?.count || 0;
      const status = count >= 30 ? '✅' : count >= 15 ? '⚠️' : '❌';
      console.log(`  ${status} ${difficulty}: ${count} exercises`);
    }
  }

  // Test 3: Validate exercise structure
  console.log('\n🔧 Testing exercise structure...');
  const sampleExercises = await db
    .select()
    .from(exercises)
    .where(eq(exercises.languageId, 5)) // C language
    .limit(5);

  for (const exercise of sampleExercises) {
    const hasTitle = !!exercise.title;
    const hasDescription = !!exercise.description;
    const hasStarterCode = !!exercise.starterCode;
    const hasValidDifficulty = ['beginner', 'intermediate', 'advanced'].includes(exercise.difficulty);
    
    const valid = hasTitle && hasDescription && hasStarterCode && hasValidDifficulty;
    console.log(`${valid ? '✅' : '❌'} Exercise "${exercise.title}": ${exercise.difficulty}`);
  }

  // Test 4: API Response validation
  console.log('\n🌐 Testing API responses...');
  try {
    const response = await fetch('http://localhost:5000/api/exercise-counts');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Exercise counts API working');
      
      const cLanguages = data.filter((lang: any) => ['c', 'cpp', 'csharp'].includes(lang.languageSlug));
      for (const lang of cLanguages) {
        const status = lang.exerciseCount >= 100 ? '✅' : '⚠️';
        console.log(`  ${status} ${lang.languageName}: ${lang.exerciseCount} exercises (API)`);
      }
    } else {
      console.log('❌ Exercise counts API error');
    }
  } catch (error) {
    console.log('❌ API connection failed');
  }

  // Test 5: Frontend display validation
  console.log('\n🖥️ Testing frontend display compatibility...');
  const testLanguages = ['c', 'cpp', 'csharp'];
  
  for (const langSlug of testLanguages) {
    try {
      const response = await fetch(`http://localhost:5000/api/languages/${langSlug}/exercises`);
      if (response.ok) {
        const exercises = await response.json();
        
        // Group by normalized difficulty
        const grouped = exercises.reduce((acc: any, ex: any) => {
          let normalized = ex.difficulty.toLowerCase();
          if (['easy', 'basic', 'principiante'].includes(normalized)) normalized = 'beginner';
          else if (['medium', 'intermedio'].includes(normalized)) normalized = 'intermediate';
          else if (['hard', 'avanzado'].includes(normalized)) normalized = 'advanced';
          
          acc[normalized] = (acc[normalized] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`${langSlug.toUpperCase()} frontend grouping:`);
        console.log(`  Beginner: ${grouped.beginner || 0}`);
        console.log(`  Intermediate: ${grouped.intermediate || 0}`);
        console.log(`  Advanced: ${grouped.advanced || 0}`);
        
      } else {
        console.log(`❌ ${langSlug} exercises API failed`);
      }
    } catch (error) {
      console.log(`❌ ${langSlug} API test failed`);
    }
  }

  console.log('\n🎉 VALIDATION COMPLETE');
  console.log('===================');
}

// Auto-run if executed directly
if (require.main === module) {
  runExerciseValidation().then(() => {
    console.log('Validation completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}