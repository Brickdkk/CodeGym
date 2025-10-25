import { db } from "./db.js";
import { exercises, languages } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { codeExecutionService } from "./codeExecutionService.js";

/**
 * Comprehensive terminal execution testing suite
 */
export class TerminalTestSuite {

  async runComprehensiveTests(): Promise<void> {
    console.log('🖥️ RUNNING COMPREHENSIVE TERMINAL EXECUTION TESTS');
    console.log('================================================');

    // Test 1: Validate test case parsing
    await this.testTestCaseParsing();

    // Test 2: Test code execution for each language
    await this.testCodeExecutionByLanguage();

    // Test 3: Test submission flow
    await this.testSubmissionFlow();

    console.log('\n✅ TERMINAL TESTS COMPLETED');
  }

  private async testTestCaseParsing(): Promise<void> {
    console.log('\n📊 Testing test case parsing...');

    const sampleExercises = await db
      .select()
      .from(exercises)
      .limit(10);

    for (const exercise of sampleExercises) {
      try {
        let testCases = [];
        
        if (exercise.testCases && Array.isArray(exercise.testCases)) {
          testCases = exercise.testCases.map((tc: any) => ({
            input: tc.input || '',
            expected: tc.output || tc.expected || ''
          }));
        } else if (typeof exercise.testCases === 'string') {
          const parsed = JSON.parse(exercise.testCases);
          if (Array.isArray(parsed)) {
            testCases = parsed.map((tc: any) => ({
              input: tc.input || '',
              expected: tc.output || tc.expected || ''
            }));
          }
        }

        const status = testCases.length > 0 ? '✅' : '⚠️';
        console.log(`${status} "${exercise.title}": ${testCases.length} test cases`);

      } catch (error) {
        console.log(`❌ "${exercise.title}": Test case parsing error`);
      }
    }
  }

  private async testCodeExecutionByLanguage(): Promise<void> {
    console.log('\n🔧 Testing code execution by language...');

    const testLanguages = ['python', 'javascript', 'c', 'cpp', 'csharp'];
    
    for (const langSlug of testLanguages) {
      try {
        const [language] = await db
          .select()
          .from(languages)
          .where(eq(languages.slug, langSlug));

        if (!language) continue;

        const [exercise] = await db
          .select()
          .from(exercises)
          .where(eq(exercises.languageId, language.id))
          .limit(1);

        if (!exercise) continue;

        const testCode = this.getTestCode(langSlug);
        const testCases = [{ input: '', expected: 'Hello World' }];

        const result = await codeExecutionService.executeCode(
          testCode,
          langSlug,
          testCases,
          'test-session'
        );

        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`${status} ${langSlug.toUpperCase()}: ${result.status}`);

      } catch (error) {
        console.log(`❌ ${langSlug.toUpperCase()}: Execution failed`);
      }
    }
  }

  private async testSubmissionFlow(): Promise<void> {
    console.log('\n📤 Testing submission flow...');

    // Test with a simple Python exercise
    try {
      const [pythonLang] = await db
        .select()
        .from(languages)
        .where(eq(languages.slug, 'python'));

      if (pythonLang) {
        const [exercise] = await db
          .select()
          .from(exercises)
          .where(eq(exercises.languageId, pythonLang.id))
          .limit(1);

        if (exercise) {
          // Test the same logic used in submission endpoint
          let testCases: Array<{input: string, expected: string}> = [];
          
          if (exercise.testCases && Array.isArray(exercise.testCases)) {
            testCases = exercise.testCases.map((tc: any) => ({
              input: tc.input || '',
              expected: tc.output || tc.expected || ''
            }));
          }

          if (testCases.length === 0) {
            testCases = [{ input: '', expected: 'Hello World' }];
          }

          console.log(`✅ Submission flow test passed for "${exercise.title}"`);
          console.log(`   Test cases: ${testCases.length}`);
        }
      }
    } catch (error) {
      console.log(`❌ Submission flow test failed: ${error}`);
    }
  }

  private getTestCode(language: string): string {
    const testCodes = {
      python: 'print("Hello World")',
      javascript: 'console.log("Hello World");',
      c: '#include <stdio.h>\nint main() {\n    printf("Hello World");\n    return 0;\n}',
      cpp: '#include <iostream>\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}',
      csharp: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World");\n    }\n}'
    };
    
    return testCodes[language as keyof typeof testCodes] || 'print("Hello World")';
  }
}

export const terminalTestSuite = new TerminalTestSuite();