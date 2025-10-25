import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

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

export class CodeExecutionService {
  private readonly TIMEOUT_MS = 10000; // 10 seconds
  private readonly TEMP_DIR = '/tmp/codegym';

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.TEMP_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  /**
   * Execute code with test cases and provide detailed VS Code Copilot-style feedback
   */
  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[],
    timeLimit: number = 2000,
    memoryLimit: number = 256
  ): Promise<ExecutionResult> {
    const sessionId = uuidv4();
    const startTime = Date.now();

    try {
      // Validate inputs
      if (!code.trim()) {
        return this.createErrorResult('Código vacío. Por favor, escribe algo de código.');
      }

      if (!testCases || testCases.length === 0) {
        return this.createErrorResult('No hay casos de prueba definidos para este ejercicio.');
      }

      // Execute code against all test cases
      const testResults = [];
      let allPassed = true;
      let totalExecutionTime = 0;

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testStartTime = Date.now();

        try {
          const result = await this.runSingleTest(code, language, testCase, sessionId, i);
          const testExecutionTime = Date.now() - testStartTime;
          totalExecutionTime += testExecutionTime;

          const passed = this.compareOutputs(result.output, testCase.expected);
          
          // Debug logging for terminal issues
          console.log(`DEBUG Test ${i + 1}:`);
          console.log(`  Input: "${testCase.input}"`);
          console.log(`  Expected: "${testCase.expected}"`);
          console.log(`  Actual: "${result.output}"`);
          console.log(`  Passed: ${passed}`);
          
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
          testResults.push({
            testNumber: i + 1,
            input: testCase.input,
            expected: testCase.expected,
            actual: `Error de ejecución: ${err?.message || 'Error desconocido'}`,
            passed: false,
            executionTime: Date.now() - testStartTime
          });
          allPassed = false;
        }
      }

      // Generate terminal output
      const output = this.generateTerminalOutput(testResults, allPassed);
      const summary = this.generateSummary(testResults, allPassed);

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
      return this.createErrorResult(`Error interno: ${err?.message || 'Error desconocido'}`);
    } finally {
      // Cleanup temp files
      this.cleanupTempFiles(sessionId);
    }
  }

  /**
   * Run code against a single test case
   */
  private async runSingleTest(
    code: string,
    language: string,
    testCase: TestCase,
    sessionId: string,
    testIndex: number
  ): Promise<{ output: string; error?: string }> {
    const fileName = `${sessionId}_test_${testIndex}`;
    
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return await this.executeJavaScript(code, testCase.input, fileName);
      case 'python':
        return await this.executePython(code, testCase.input, fileName);
      case 'c':
        return await this.executeC(code, testCase.input, fileName);
      case 'cpp':
      case 'c++':
        return await this.executeCpp(code, testCase.input, fileName);
      case 'java':
        return await this.executeJava(code, testCase.input, fileName);
      default:
        throw new Error(`Lenguaje no soportado: ${language}`);
    }
  }

  /**
   * Execute JavaScript code
   */
  private async executeJavaScript(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(this.TEMP_DIR, `${fileName}.js`);
    
    // Wrap code to handle input/output
    const wrappedCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputLines = \`${input}\`.trim().split('\\n');
let inputIndex = 0;

// Mock console.log to capture output
let output = [];
const originalLog = console.log;
console.log = (...args) => {
  output.push(args.join(' '));
};

// Mock input function
function input() {
  return inputLines[inputIndex++] || '';
}

// Mock prompt for simple input
const prompt = () => inputLines[inputIndex++] || '';

try {
  ${code}
  
  // Print captured output
  originalLog(output.join('\\n'));
} catch (error) {
  originalLog('Runtime Error: ' + error.message);
}

rl.close();
`;

    await fs.writeFile(filePath, wrappedCode);
    
    try {
      const { stdout, stderr } = await execAsync(`timeout 10s node "${filePath}"`, {
        cwd: this.TEMP_DIR
      });
      
      return {
        output: stdout.trim(),
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error) {
      return {
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Execute Python code
   */
  private async executePython(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const filePath = path.join(this.TEMP_DIR, `${fileName}.py`);
    
    // Extract function name and create proper execution
    const functionMatch = code.match(/def\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : 'main';
    
    // Create execution wrapper with enhanced debugging
    const wrappedCode = `
import sys

# User's code
${code}

# Execute with proper input handling
try:
    input_str = "${input}"
    
    # Handle empty input
    if input_str == "":
        result = ${functionName}()
    else:
        # Smart input conversion
        if input_str.isdigit() or (input_str.startswith('-') and input_str[1:].isdigit()):
            # It's an integer
            result = ${functionName}(int(input_str))
        else:
            try:
                # Try float
                result = ${functionName}(float(input_str))
            except ValueError:
                # String input
                result = ${functionName}(input_str)
    
    # Output result directly without extra formatting
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
        error: err.stdout || err.message || 'Execution failed'
      };
    }
  }

  /**
   * Execute C code
   */
  private async executeC(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const sourcePath = path.join(this.TEMP_DIR, `${fileName}.c`);
    const execPath = path.join(this.TEMP_DIR, fileName);
    
    await fs.writeFile(sourcePath, code);
    
    try {
      // Compile
      await execAsync(`gcc "${sourcePath}" -o "${execPath}"`, {
        cwd: this.TEMP_DIR
      });
      
      // Execute with input
      const { stdout, stderr } = await execAsync(`echo "${input}" | timeout 10s "${execPath}"`, {
        cwd: this.TEMP_DIR
      });
      
      return {
        output: stdout.trim(),
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error) {
      return {
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Execute C++ code
   */
  private async executeCpp(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const sourcePath = path.join(this.TEMP_DIR, `${fileName}.cpp`);
    const execPath = path.join(this.TEMP_DIR, fileName);
    
    await fs.writeFile(sourcePath, code);
    
    try {
      // Compile
      await execAsync(`g++ "${sourcePath}" -o "${execPath}"`, {
        cwd: this.TEMP_DIR
      });
      
      // Execute with input
      const { stdout, stderr } = await execAsync(`echo "${input}" | timeout 10s "${execPath}"`, {
        cwd: this.TEMP_DIR
      });
      
      return {
        output: stdout.trim(),
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error) {
      return {
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Execute Java code
   */
  private async executeJava(code: string, input: string, fileName: string): Promise<{ output: string; error?: string }> {
    const sourcePath = path.join(this.TEMP_DIR, `${fileName}.java`);
    
    await fs.writeFile(sourcePath, code);
    
    try {
      // Compile
      await execAsync(`javac "${sourcePath}"`, {
        cwd: this.TEMP_DIR
      });
      
      // Execute with input
      const { stdout, stderr } = await execAsync(`echo "${input}" | timeout 10s java -cp "${this.TEMP_DIR}" ${fileName}`, {
        cwd: this.TEMP_DIR
      });
      
      return {
        output: stdout.trim(),
        error: stderr ? stderr.trim() : undefined
      };
    } catch (error) {
      return {
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Extract function call from code
   */
  private extractFunctionCall(code: string, input: string): string {
    // Extract function name from Python code
    const pythonMatch = code.match(/def\s+(\w+)/);
    if (pythonMatch) {
      const functionName = pythonMatch[1];
      // Handle different input types correctly
      if (input === '' || input === 'null' || input === 'undefined') {
        return `${functionName}()`;
      }
      // Check if input is numeric
      if (/^\d+$/.test(input.trim())) {
        return `${functionName}(${input})`;
      }
      // String input needs quotes
      return `${functionName}("${input}")`;
    }
    return `main()`;
  }

  /**
   * Compare actual output with expected output
   */
  private compareOutputs(actual: string, expected: string): boolean {
    const normalizeOutput = (str: string) => {
      return str.toString()
        .replace(/\r\n/g, '\n')
        .replace(/\n/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
    };
    
    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);
    
    // Try exact match first
    if (normalizedActual === normalizedExpected) {
      return true;
    }
    
    // Try numeric comparison if both can be parsed as numbers
    const actualNum = parseFloat(actual.trim());
    const expectedNum = parseFloat(expected.trim());
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      return Math.abs(actualNum - expectedNum) < 0.0001;
    }
    
    return false;
  }

  /**
   * Generate VS Code Copilot-style terminal output
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

    output += '\n' + '='.repeat(60) + '\n';
    
    const passedCount = testResults.filter(t => t.passed).length;
    output += `Resumen: ${passedCount}/${testResults.length} casos de prueba correctos\n`;
    
    if (!allPassed) {
      output += '\n💡 Sugerencia: Revisa los casos que fallaron y ajusta tu código.\n';
    }

    return output;
  }

  /**
   * Generate summary message
   */
  private generateSummary(testResults: any[], allPassed: boolean): string {
    const passedCount = testResults.filter(t => t.passed).length;
    const totalCount = testResults.length;

    if (allPassed) {
      return `¡Perfecto! Tu código pasó todos los ${totalCount} casos de prueba.`;
    } else {
      return `Tu código pasó ${passedCount} de ${totalCount} casos de prueba. Revisa los casos que fallaron.`;
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
      output: `❌ ERROR\n\n${message}`,
      error: message,
      testResults: [],
      summary: message
    };
  }

  /**
   * Estimate memory usage (simplified)
   */
  private estimateMemoryUsage(code: string): number {
    // Simple estimation based on code length
    return Math.min(256, Math.max(1, Math.floor(code.length / 100)));
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTempFiles(sessionId: string) {
    try {
      const files = await fs.readdir(this.TEMP_DIR);
      const filesToDelete = files.filter(file => file.includes(sessionId));
      
      await Promise.all(
        filesToDelete.map(file => 
          fs.unlink(path.join(this.TEMP_DIR, file)).catch(() => {})
        )
      );
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

export const codeExecutionService = new CodeExecutionService();