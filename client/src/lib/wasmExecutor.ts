/**
 * wasmExecutor.ts — Unified client-side code execution interface.
 *
 * Dispatches code to the appropriate language runner (Pyodide, Web Worker,
 * JSCPP, iframe) and returns standardized results. The server NEVER receives
 * user code for execution.
 */

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
  executionTime: number; // ms
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  executionTime: number;
  error: string | null;
}

export interface RunResult {
  testResults: TestResult[];
  allTestsPassed: boolean;
  totalExecutionTime: number;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded';
}

export type LanguageSlug = 'python' | 'javascript' | 'cpp' | 'c' | 'html-css';

/**
 * Execute user code against a set of test cases, entirely client-side.
 */
export async function executeCode(
  code: string,
  languageSlug: LanguageSlug,
  testCases: TestCase[],
  timeLimit: number = 5000,
): Promise<RunResult> {
  const runner = getRunner(languageSlug);
  const testResults: TestResult[] = [];
  let totalTime = 0;
  let hasRuntimeError = false;
  let hasTimeout = false;

  for (const tc of testCases) {
    const start = performance.now();
    try {
      const result = await withTimeout(
        runner(code, tc.input),
        timeLimit,
      );
      const elapsed = performance.now() - start;
      totalTime += elapsed;

      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(tc.expected);

      testResults.push({
        input: tc.input,
        expected: tc.expected,
        actual: result.stdout,
        passed: actual === expected,
        executionTime: Math.round(elapsed),
        error: result.error,
      });

      if (result.error) {
        hasRuntimeError = true;
      }
    } catch (err: any) {
      const elapsed = performance.now() - start;
      totalTime += elapsed;

      const isTimeout = err?.message === 'TIMEOUT';
      if (isTimeout) hasTimeout = true;
      else hasRuntimeError = true;

      testResults.push({
        input: tc.input,
        expected: tc.expected,
        actual: '',
        passed: false,
        executionTime: Math.round(elapsed),
        error: isTimeout
          ? `Time limit exceeded (${timeLimit}ms)`
          : (err?.message || 'Unknown error'),
      });
    }
  }

  const allTestsPassed = testResults.length > 0 && testResults.every(r => r.passed);

  let status: RunResult['status'] = 'wrong_answer';
  if (allTestsPassed) status = 'accepted';
  else if (hasTimeout) status = 'time_limit_exceeded';
  else if (hasRuntimeError) status = 'runtime_error';

  return {
    testResults,
    allTestsPassed,
    totalExecutionTime: Math.round(totalTime),
    status,
  };
}

// ---------------------------------------------------------------------------
// Runner dispatch
// ---------------------------------------------------------------------------

type RunnerFn = (code: string, input: string) => Promise<ExecutionResult>;

function getRunner(lang: LanguageSlug): RunnerFn {
  switch (lang) {
    case 'python':
      return runPython;
    case 'javascript':
      return runJavaScript;
    case 'cpp':
    case 'c':
      return runCpp;
    case 'html-css':
      return runHtmlCss;
    default:
      throw new Error(`Unsupported language: ${lang}`);
  }
}

// Lazy-imported runners (code-split)
async function runPython(code: string, input: string): Promise<ExecutionResult> {
  const { executePython } = await import('./runners/pythonRunner');
  return executePython(code, input);
}

async function runJavaScript(code: string, input: string): Promise<ExecutionResult> {
  const { executeJavaScript } = await import('./runners/jsRunner');
  return executeJavaScript(code, input);
}

async function runCpp(code: string, input: string): Promise<ExecutionResult> {
  const { executeCpp } = await import('./runners/cppRunner');
  return executeCpp(code, input);
}

async function runHtmlCss(code: string, _input: string): Promise<ExecutionResult> {
  const { executeHtmlCss } = await import('./runners/htmlRunner');
  return executeHtmlCss(code);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeOutput(s: string): string {
  return s.replace(/\r\n/g, '\n').trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
