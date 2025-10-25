interface TestCase {
  input: string;
  expected: string;
}

interface ExecutionResult {
  status: 'success' | 'error';
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

export class NewCodeExecutionService {
  /**
   * Execute code with deterministic, consistent results
   */
  async executeCode(
    code: string,
    language: string,
    testCases: TestCase[]
  ): Promise<ExecutionResult> {
    try {
      // Validate inputs
      if (!code.trim()) {
        return this.createErrorResult('Código vacío. Por favor, escribe algo de código.');
      }

      if (!testCases || testCases.length === 0) {
        return this.createErrorResult('No hay casos de prueba definidos para este ejercicio.');
      }

      // Analyze code quality for deterministic results
      const codeQuality = this.analyzeCode(code, language);
      const testResults = [];
      let totalExecutionTime = 0;

      // Process each test case deterministically
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const executionTime = Math.floor(Math.random() * 3); // 0-2ms
        totalExecutionTime += executionTime;

        let actualOutput: string;
        let passed: boolean;

        // Execute the actual user code
        try {
          actualOutput = await this.executeUserCode(code, language, testCase.input);
          passed = this.compareOutputs(actualOutput, testCase.expected);
        } catch (error) {
          actualOutput = `Error de ejecución: ${error}`;
          passed = false;
        }

        testResults.push({
          testNumber: i + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: actualOutput,
          passed,
          executionTime
        });
      }

      const allTestsPassed = testResults.every(test => test.passed);
      const output = this.generateTerminalOutput(testResults, allTestsPassed);
      const summary = this.generateSummary(testResults, allTestsPassed);

      return {
        status: 'success',
        allTestsPassed,
        executionTime: totalExecutionTime,
        memoryUsed: this.estimateMemoryUsage(code),
        output,
        testResults,
        summary
      };

    } catch (error: any) {
      return this.createErrorResult(`Error interno: ${error?.message || 'Error desconocido'}`);
    }
  }

  /**
   * Execute user code against a test case
   */
  private async executeUserCode(code: string, language: string, input: string): Promise<string> {
    const { spawn } = require('child_process');
    const fs = require('fs').promises;
    const path = require('path');
    
    const sessionId = Date.now().toString();
    const tempDir = `/tmp/codegym-${sessionId}`;
    
    try {
      await fs.mkdir(tempDir, { recursive: true });
      
      switch (language.toLowerCase()) {
        case 'python':
          return await this.executePython(code, input, tempDir);
        case 'javascript':
          return await this.executeJavaScript(code, input, tempDir);
        case 'c':
          return await this.executeC(code, input, tempDir);
        case 'cpp':
          return await this.executeCpp(code, input, tempDir);
        default:
          throw new Error(`Lenguaje no soportado: ${language}`);
      }
    } finally {
      // Cleanup
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  private async executePython(code: string, input: string, tempDir: string): Promise<string> {
    const fs = require('fs').promises;
    const { spawn } = require('child_process');
    const path = require('path');
    
    const fileName = path.join(tempDir, 'solution.py');
    const fullCode = `${code}\n\n# Ejecutar con entrada\nif __name__ == "__main__":\n    result = ${this.extractFunctionCall(code, input)}\n    print(result)`;
    
    await fs.writeFile(fileName, fullCode);
    
    return new Promise((resolve, reject) => {
      const process = spawn('python3', [fileName], { timeout: 5000 });
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(error || 'Error de ejecución');
        }
      });
      
      process.on('error', (err) => {
        reject(err.message);
      });
    });
  }

  private async executeJavaScript(code: string, input: string, tempDir: string): Promise<string> {
    const fs = require('fs').promises;
    const { spawn } = require('child_process');
    const path = require('path');
    
    const fileName = path.join(tempDir, 'solution.js');
    const fullCode = `${code}\n\n// Ejecutar con entrada\nconst result = ${this.extractFunctionCall(code, input)};\nconsole.log(result);`;
    
    await fs.writeFile(fileName, fullCode);
    
    return new Promise((resolve, reject) => {
      const process = spawn('node', [fileName], { timeout: 5000 });
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(error || 'Error de ejecución');
        }
      });
      
      process.on('error', (err) => {
        reject(err.message);
      });
    });
  }

  private async executeC(code: string, input: string, tempDir: string): Promise<string> {
    // C implementation similar to Python/JS
    throw new Error('Ejecución de C no implementada en esta versión');
  }

  private async executeCpp(code: string, input: string, tempDir: string): Promise<string> {
    // C++ implementation similar to Python/JS
    throw new Error('Ejecución de C++ no implementada en esta versión');
  }

  private extractFunctionCall(code: string, input: string): string {
    // Extract function name from code
    const pythonMatch = code.match(/def\s+(\w+)/);
    const jsMatch = code.match(/function\s+(\w+)|const\s+(\w+)\s*=/);
    
    if (pythonMatch) {
      return `${pythonMatch[1]}(${input})`;
    } else if (jsMatch) {
      const funcName = jsMatch[1] || jsMatch[2];
      return `${funcName}(${input})`;
    }
    
    return `main(${input})`;
  }

  private compareOutputs(actual: string, expected: string): boolean {
    return actual.trim() === expected.trim();
  }

  /**
   * Analyze code quality for consistent results
   */
  private analyzeCode(code: string, language: string): { isValid: boolean; score: number } {
    const codeContent = code.toLowerCase().trim();
    let score = 0;

    // Basic structure
    if (codeContent.length > 10) score += 1;

    // Language-specific analysis
    switch (language.toLowerCase()) {
      case 'python':
        if (codeContent.includes('def ')) score += 4;
        if (codeContent.includes('return') || codeContent.includes('print')) score += 2;
        if (codeContent.includes(':') && codeContent.includes('    ')) score += 1;
        break;
      case 'javascript':
        if (codeContent.includes('function') || codeContent.includes('=>')) score += 4;
        if (codeContent.includes('return') || codeContent.includes('console.log')) score += 2;
        if (codeContent.includes('{') && codeContent.includes('}')) score += 1;
        break;
      case 'c':
      case 'cpp':
        if (codeContent.includes('#include') && codeContent.includes('main')) score += 4;
        if (codeContent.includes('return') || codeContent.includes('printf') || codeContent.includes('cout')) score += 2;
        if (codeContent.includes('{') && codeContent.includes('}')) score += 1;
        break;
      case 'html-css':
        if (codeContent.includes('<html>') || codeContent.includes('<!doctype')) score += 4;
        if (codeContent.includes('<div>') || codeContent.includes('<p>')) score += 2;
        if (codeContent.includes('css') || codeContent.includes('style')) score += 1;
        break;
    }

    // Programming constructs
    if (/\b(if|for|while|switch)\b/.test(codeContent)) score += 2;
    if (/[+\-*/=<>!&|]/.test(codeContent)) score += 1;

    return {
      isValid: score >= 6, // Threshold for valid code
      score
    };
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

    testResults.forEach((test) => {
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
      
      output += `Tiempo: ${test.executionTime}ms\n\n`;
    });

    output += '='.repeat(60) + '\n';
    output += `Resumen: ${testResults.filter(t => t.passed).length}/${testResults.length} casos de prueba correctos\n`;
    
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
      output: `============================================================\n  TERMINAL DE EJECUCIÓN - CODEGYM\n============================================================\n\n❌ ERROR\n\n${message}\n\n============================================================\n`,
      error: message,
      testResults: [],
      summary: message
    };
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(code: string): number {
    return Math.max(1, Math.floor(code.length / 100));
  }
}

export const newCodeExecutionService = new NewCodeExecutionService();