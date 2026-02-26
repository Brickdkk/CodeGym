/**
 * testRunner.ts — High-level client-side test runner.
 *
 * Fetches test cases from the server, executes code locally via WASM runners,
 * and returns structured results. This is the main entry point used by
 * ExercisePage and other UI components.
 */

import { executeCode, type RunResult, type TestCase, type LanguageSlug } from './wasmExecutor';

export type { RunResult, TestCase, LanguageSlug };
export type { TestResult } from './wasmExecutor';

/**
 * Run code against test cases from the server. Used by the "Ejecutar Codigo"
 * (Run Code) button — no authentication required.
 */
export async function runCode(
  slug: string,
  code: string,
): Promise<RunResult> {
  // 1. Fetch test cases + language from the server
  const res = await fetch(`/api/exercises/${slug}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  const testCases: TestCase[] = data.testCases || [];
  const languageSlug: LanguageSlug = data.languageSlug || 'javascript';

  // 2. Execute locally via WASM
  return executeCode(code, languageSlug, testCases);
}

/**
 * Submit code: run tests locally and send results to server for persistence.
 * Used by the "Enviar Solucion" (Submit Solution) button — requires auth.
 */
export async function submitCode(
  slug: string,
  code: string,
): Promise<{ runResult: RunResult; submission: any }> {
  // 1. Run locally first
  const runResult = await runCode(slug, code);

  // 2. Send results to server for persistence
  const res = await fetch(`/api/exercises/${slug}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      code,
      status: runResult.status,
      executionTime: runResult.totalExecutionTime,
      memoryUsed: 0, // WASM doesn't expose memory metrics
      testResults: runResult.testResults,
      allTestsPassed: runResult.allTestsPassed,
    }),
  });

  if (!res.ok) {
    // Even if persist fails, we still have local results
    const err = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(err.message || `Submit failed: ${res.status}`);
  }

  const submission = await res.json();
  return { runResult, submission };
}
