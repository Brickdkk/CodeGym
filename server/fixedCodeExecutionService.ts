import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
import path from 'path';
import crypto from 'crypto';

interface TestCase {
  input: string;
  expected: string;
}

interface ExecutionResult {
  status: 'success' | 'error' | 'timeout' | 'runtime_error';
  allTestsPassed: boolean;
  executionTime: number;
  memoryUsed: number;
  output: string;
  error?: string;
  testResults: Array<{
    testNumber: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    executionTime: number;
  }>;
  summary: string;
}

export class FixedCodeExecutionService {
  private readonly TIMEOUT_MS = 10000;
  private readonly TEMP_DIR = '/tmp/codegym-fixed';

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  /**
   * Execute code with comprehensive test case evaluation
   */
  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    sessionId: string
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const testResults: any[] = [];
    let allPassed = true;
    let totalExecutionTime = 0;

    console.log(`🚀 EXECUTING ${language.toUpperCase()} CODE`);
    console.log(`Session: ${sessionId}`);
    console.log(`Test Cases: ${testCases.length}`);

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testStartTime = Date.now();

        console.log(`\n--- Test Case ${i + 1} ---`);
        console.log(`Input: "${testCase.input}"`);
        console.log(`Expected: "${testCase.expected}"`);

        try {
          const result = await this.executeCodeForLanguage(code, language, testCase.input, sessionId, i);
          const testExecutionTime = Date.now() - testStartTime;
          totalExecutionTime += testExecutionTime;

          console.log(`Actual: "${result.output}"`);
          
          const passed = this.smartCompareOutputs(result.output, testCase.expected);
          console.log(`Passed: ${passed}`);

          testResults.push({
            testNumber: i + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: result.output,
            passed,
            executionTime: testExecutionTime
          });

          if (!passed) {
            allPassed = false;
          }
        } catch (error: unknown) {
          const err = error as any;
          console.log(`Error: ${err?.message}`);
          
          testResults.push({
            testNumber: i + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: `Error: ${err?.message || 'Unknown error'}`,
            passed: false,
            executionTime: Date.now() - testStartTime
          });
          allPassed = false;
        }
      }

      const output = this.generateTerminalOutput(testResults, allPassed);
      const summary = this.generateSummary(testResults, allPassed);

      console.log(`\n🏁 EXECUTION COMPLETED`);
      console.log(`All Tests Passed: ${allPassed}`);
      console.log(`Total Time: ${totalExecutionTime}ms`);

      return {
        status: 'success',
        allTestsPassed: allPassed,
        executionTime: totalExecutionTime,
        memoryUsed: this.estimateMemoryUsage(code),
        output,
        testResults,
        summary
      };

    } catch (error: unknown) {
      const err = error as any;
      return this.createErrorResult(`Internal error: ${err?.message || 'Unknown error'}`);
    } finally {
      await this.cleanupTempFiles(sessionId);
    }
  }

  /**
   * Execute code for specific language
   */
  private async executeCodeForLanguage(
    code: string,
    language: string,
    input: string,
    sessionId: string,
    testIndex: number
  ): Promise<{ output: string; error?: string }> {
    const fileName = `${sessionId}_test_${testIndex}`;
    
    switch (language.toLowerCase()) {
      case 'python':
        return this.executePythonCode(code, input, fileName);
      case 'javascript':
        return this.executeJavaScriptCode(code, input, fileName);
      case 'c':
        return this.executeCCode(code, input, fileName);
      case 'cpp':
      case 'c++':
        return this.executeCppCode(code, input, fileName);
      case 'java':
        return this.executeJavaCode(code, input, fileName);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Execute Python code with robust input handling
   */
  private async executePythonCode(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(this.TEMP_DIR, `${fileName}.py`);
    
    // Extract function name
    const functionMatch = code.match(/def\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : 'main';
    
    // Create execution wrapper
    const wrappedCode = `
import sys

# User's code
${code}

# Execute with proper input handling
try:
    input_str = "${input}"
    
    if input_str == "":
        result = ${functionName}()
    else:
        # Smart type conversion
        if input_str.isdigit() or (input_str.startswith('-') and input_str[1:].isdigit()):
            result = ${functionName}(int(input_str))
        else:
            try:
                result = ${functionName}(float(input_str))
            except ValueError:
                result = ${functionName}(input_str)
    
    if result is not None:
        print(result)
    
except Exception as e:
    print(f"Error: {str(e)}")
`;

    await fs.writeFile(filePath, wrappedCode);
    
    try {
      const { stdout, stderr } = await execAsync(`cd "${this.TEMP_DIR}" && timeout 10s python3 "${fileName}.py"`, {
        encoding: 'utf8'
      });
      
      return {
        output: stdout ? stdout.trim() : '',
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error: unknown) {
      const err = error as any;
      return {
        output: '',
        error: err.stdout || err.message || 'Python execution failed'
      };
    }
  }

  /**
   * Execute JavaScript code
   */
  private async executeJavaScriptCode(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(this.TEMP_DIR, `${fileName}.js`);
    
    const functionMatch = code.match(/function\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : 'main';
    
    const wrappedCode = `
${code}

try {
    const input = "${input}";
    let result;
    
    if (input === "") {
        result = ${functionName}();
    } else {
        const numInput = Number(input);
        if (!isNaN(numInput)) {
            result = ${functionName}(numInput);
        } else {
            result = ${functionName}(input);
        }
    }
    
    console.log(result);
} catch (error) {
    console.log(\`Error: \${error.message}\`);
}
`;

    await fs.writeFile(filePath, wrappedCode);
    
    try {
      const { stdout, stderr } = await execAsync(`cd "${this.TEMP_DIR}" && timeout 10s node "${fileName}.js"`, {
        encoding: 'utf8'
      });
      
      return {
        output: stdout ? stdout.trim() : '',
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error: unknown) {
      const err = error as any;
      return {
        output: '',
        error: err.stdout || err.message || 'JavaScript execution failed'
      };
    }
  }

  /**
   * Execute C code
   */
  private async executeCCode(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const sourcePath = path.join(this.TEMP_DIR, `${fileName}.c`);
    const execPath = path.join(this.TEMP_DIR, fileName);
    
    await fs.writeFile(sourcePath, code);
    
    try {
      await execAsync(`cd "${this.TEMP_DIR}" && gcc "${fileName}.c" -o "${fileName}"`, {
        encoding: 'utf8'
      });
      
      const { stdout, stderr } = await execAsync(`cd "${this.TEMP_DIR}" && echo "${input}" | timeout 10s ./${fileName}`, {
        encoding: 'utf8'
      });
      
      return {
        output: stdout ? stdout.trim() : '',
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error: unknown) {
      const err = error as any;
      return {
        output: '',
        error: err.stdout || err.message || 'C execution failed'
      };
    }
  }

  /**
   * Execute C++ code
   */
  private async executeCppCode(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const sourcePath = path.join(this.TEMP_DIR, `${fileName}.cpp`);
    const execPath = path.join(this.TEMP_DIR, fileName);
    
    await fs.writeFile(sourcePath, code);
    
    try {
      await execAsync(`cd "${this.TEMP_DIR}" && g++ "${fileName}.cpp" -o "${fileName}"`, {
        encoding: 'utf8'
      });
      
      const { stdout, stderr } = await execAsync(`cd "${this.TEMP_DIR}" && echo "${input}" | timeout 10s ./${fileName}`, {
        encoding: 'utf8'
      });
      
      return {
        output: stdout ? stdout.trim() : '',
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error: unknown) {
      const err = error as any;
      return {
        output: '',
        error: err.stdout || err.message || 'C++ execution failed'
      };
    }
  }

  /**
   * Execute Java code
   */
  private async executeJavaCode(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const sourcePath = path.join(this.TEMP_DIR, `${fileName}.java`);
    
    await fs.writeFile(sourcePath, code);
    
    try {
      await execAsync(`cd "${this.TEMP_DIR}" && javac "${fileName}.java"`, {
        encoding: 'utf8'
      });
      
      const { stdout, stderr } = await execAsync(`cd "${this.TEMP_DIR}" && echo "${input}" | timeout 10s java ${fileName}`, {
        encoding: 'utf8'
      });
      
      return {
        output: stdout ? stdout.trim() : '',
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error: unknown) {
      const err = error as any;
      return {
        output: '',
        error: err.stdout || err.message || 'Java execution failed'
      };
    }
  }

  /**
   * Smart output comparison with multiple strategies
   */
  private smartCompareOutputs(actual: string, expected: string): boolean {
    // Normalize both strings
    const normalizeOutput = (str: string) => {
      return str.toString()
        .replace(/\r\n/g, '\n')
        .replace(/\n/g, '')
        .trim()
        .replace(/\s+/g, ' ');
    };
    
    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);
    
    // Strategy 1: Exact match
    if (normalizedActual === normalizedExpected) {
      return true;
    }
    
    // Strategy 2: Case-insensitive match
    if (normalizedActual.toLowerCase() === normalizedExpected.toLowerCase()) {
      return true;
    }
    
    // Strategy 3: Numeric comparison
    const actualNum = parseFloat(actual.trim());
    const expectedNum = parseFloat(expected.trim());
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      return Math.abs(actualNum - expectedNum) < 0.0001;
    }
    
    // Strategy 4: Contains expected value
    if (normalizedActual.includes(normalizedExpected)) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate terminal output
   */
  private generateTerminalOutput(testResults: any[], allPassed: boolean): string {
    let output = '='.repeat(60) + '\n';
    output += '  TERMINAL DE EJECUCIÓN - CODEGYM\n';
    output += '='.repeat(60) + '\n\n';

    if (allPassed) {
      output += '✅ TODAS LAS PRUEBAS SUPERADAS\n\n';
      output += `🎉 ¡Excelente! Tu código pasó todos los ${testResults.length} casos de prueba.\n\n`;
    } else {
      output += '❌ ALGUNAS PRUEBAS FALLARON\n\n';
    }

    testResults.forEach((test, index) => {
      output += `─── Caso de Prueba ${test.testNumber} ───\n`;
      output += `Entrada: ${test.input}\n`;
      output += `Esperado: ${test.expected}\n`;
      output += `Obtenido: ${test.actual}\n`;
      
      if (test.passed) {
        output += `Estado: ✅ CORRECTO\n`;
      } else {
        output += `Estado: ❌ INCORRECTO\n`;
        output += `Problema: La salida no coincide con lo esperado.\n`;
      }
      
      output += `Tiempo: ${test.executionTime}ms\n`;
      
      if (index < testResults.length - 1) {
        output += '\n';
      }
    });

    output += '\n' + '='.repeat(60);
    return output;
  }

  /**
   * Generate summary
   */
  private generateSummary(testResults: any[], allPassed: boolean): string {
    const passed = testResults.filter(t => t.passed).length;
    const total = testResults.length;
    
    if (allPassed) {
      return `✅ Perfecto! ${passed}/${total} casos de prueba superados`;
    } else {
      return `❌ ${passed}/${total} casos de prueba superados. Revisa tu código.`;
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(message: string): ExecutionResult {
    return {
      status: 'error',
      allTestsPassed: false,
      executionTime: 0,
      memoryUsed: 0,
      output: `❌ ERROR DE EJECUCIÓN\n\n${message}`,
      error: message,
      testResults: [],
      summary: `❌ Error: ${message}`
    };
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(code: string): number {
    return Math.max(1024, code.length * 8);
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTempFiles(sessionId: string) {
    try {
      const files = await fs.readdir(this.TEMP_DIR);
      for (const file of files) {
        if (file.includes(sessionId)) {
          await fs.unlink(path.join(this.TEMP_DIR, file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

export const fixedCodeExecutionService = new FixedCodeExecutionService();