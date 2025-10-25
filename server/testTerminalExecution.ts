import { codeExecutionService } from "./codeExecutionService.js";
import { db } from "./db.js";
import { exercises, languages } from "../shared/schema.js";
import { eq } from "drizzle-orm";

/**
 * Comprehensive terminal execution testing for all languages
 */
async function testTerminalExecution(): Promise<void> {
  console.log('🖥️ TESTING TERMINAL EXECUTION ACROSS ALL LANGUAGES');
  console.log('================================================');

  // Test the specific Python exercise from the image (Calculadora de edad)
  console.log('\n🎯 Testing Python Age Calculator Exercise...');
  
  const testCode = `def calcular_edad(año_nacimiento):
    año_nacimiento = int(año_nacimiento)
    print(2024 - año_nacimiento)`;

  const testCases = [
    { input: "1990", expected: "34" },
    { input: "2000", expected: "24" }
  ];

  for (const testCase of testCases) {
    try {
      const result = await codeExecutionService.executeCode(
        testCode,
        'python',
        [testCase],
        'test-calculadora'
      );

      console.log(`Input: ${testCase.input}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Got: ${result.output}`);
      console.log(`Status: ${result.allTestsPassed ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Test Results:`, result.testResults);
      console.log('---');
    } catch (error) {
      console.log(`❌ Error testing case ${testCase.input}:`, error);
    }
  }

  // Test other languages
  console.log('\n🔧 Testing Other Languages...');
  
  const languageTests = {
    javascript: {
      code: 'function calcular_edad(año) { return 2024 - parseInt(año); }',
      cases: [{ input: "1990", expected: "34" }]
    },
    python: {
      code: 'def test_func(x): return int(x) * 2',
      cases: [{ input: "5", expected: "10" }]
    }
  };

  for (const [lang, test] of Object.entries(languageTests)) {
    try {
      const result = await codeExecutionService.executeCode(
        test.code,
        lang,
        test.cases,
        `test-${lang}`
      );
      
      console.log(`${lang.toUpperCase()}: ${result.allTestsPassed ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`${lang.toUpperCase()}: ❌ Error`);
    }
  }

  console.log('\n✅ Terminal testing completed');
}

// Run tests
testTerminalExecution().catch(console.error);