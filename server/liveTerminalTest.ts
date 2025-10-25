import { fixedCodeExecutionService } from "./fixedCodeExecutionService.js";

/**
 * Live terminal testing - reproducing the exact Python calculator issue
 */
async function testPythonCalculator(): Promise<void> {
  console.log('🔥 LIVE TERMINAL TEST - Python Calculator');
  console.log('=========================================');

  // The exact Python code from the user's image
  const userCode = `def calcular_edad(año_nacimiento):
    año_nacimiento = int(año_nacimiento)
    print(2024 - año_nacimiento)`;

  // Test cases that should pass
  const testCases = [
    { input: "1990", expected: "34" },
    { input: "2000", expected: "24" },
    { input: "1985", expected: "39" }
  ];

  console.log('📝 User Code:');
  console.log(userCode);
  console.log('\n🧪 Test Cases:');
  testCases.forEach((tc, i) => {
    console.log(`  ${i + 1}. Input: ${tc.input}, Expected: ${tc.expected}`);
  });

  try {
    console.log('\n🚀 EXECUTING...');
    const result = await fixedCodeExecutionService.executeCode(
      userCode,
      'python',
      testCases,
      'live-test-calculator'
    );

    console.log('\n📊 RESULTS:');
    console.log(`Status: ${result.status}`);
    console.log(`All Tests Passed: ${result.allTestsPassed}`);
    console.log(`Execution Time: ${result.executionTime}ms`);
    console.log(`Memory Used: ${result.memoryUsed} bytes`);

    console.log('\n📋 Test Results Detail:');
    result.testResults.forEach((test, i) => {
      console.log(`Test ${test.testNumber}:`);
      console.log(`  Input: "${test.input}"`);
      console.log(`  Expected: "${test.expected}"`);
      console.log(`  Actual: "${test.actual}"`);
      console.log(`  Passed: ${test.passed ? '✅' : '❌'}`);
      console.log(`  Time: ${test.executionTime}ms`);
      console.log('');
    });

    console.log('\n🖥️ TERMINAL OUTPUT:');
    console.log(result.output);

    console.log('\n📝 SUMMARY:');
    console.log(result.summary);

    // Overall assessment
    if (result.allTestsPassed) {
      console.log('\n🎉 SUCCESS: Terminal execution working correctly!');
    } else {
      console.log('\n❌ ISSUE: Terminal still failing - investigating...');
      
      // Additional debugging
      console.log('\n🔍 DEBUGGING INFO:');
      result.testResults.forEach(test => {
        if (!test.passed) {
          console.log(`Failed test ${test.testNumber}:`);
          console.log(`  Expected type: ${typeof test.expected}`);
          console.log(`  Actual type: ${typeof test.actual}`);
          console.log(`  Expected length: ${test.expected.length}`);
          console.log(`  Actual length: ${test.actual.length}`);
          console.log(`  Character codes expected: ${test.expected.split('').map(c => c.charCodeAt(0))}`);
          console.log(`  Character codes actual: ${test.actual.split('').map(c => c.charCodeAt(0))}`);
        }
      });
    }

  } catch (error) {
    console.error('💥 EXECUTION ERROR:', error);
  }
}

// Test other critical languages
async function testMultiLanguageExecution(): Promise<void> {
  console.log('\n🌐 MULTI-LANGUAGE TERMINAL TEST');
  console.log('===============================');

  const languageTests = [
    {
      language: 'javascript',
      code: 'function calcular_edad(año) { return 2024 - parseInt(año); }',
      testCases: [{ input: "1990", expected: "34" }],
      name: 'JavaScript Calculator'
    },
    {
      language: 'python',
      code: 'def suma(a, b): return int(a) + int(b)',
      testCases: [{ input: "5", expected: "10" }], // Testing 5 + 5 = 10
      name: 'Python Sum Function'
    }
  ];

  for (const test of languageTests) {
    console.log(`\n🔧 Testing ${test.name}...`);
    try {
      const result = await fixedCodeExecutionService.executeCode(
        test.code,
        test.language,
        test.testCases,
        `multi-test-${test.language}`
      );
      
      const status = result.allTestsPassed ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.language.toUpperCase()}: ${status}`);
      
      if (!result.allTestsPassed) {
        console.log(`  Failure reason: ${result.testResults[0]?.actual || 'No output'}`);
      }
    } catch (error) {
      console.log(`${test.language.toUpperCase()}: ❌ ERROR - ${error}`);
    }
  }
}

// Run comprehensive tests
async function runComprehensiveTests(): Promise<void> {
  console.log('🎯 COMPREHENSIVE TERMINAL EXECUTION TESTS');
  console.log('==========================================');
  
  await testPythonCalculator();
  await testMultiLanguageExecution();
  
  console.log('\n✅ Testing completed - check results above');
}

// Execute tests
runComprehensiveTests().catch(console.error);