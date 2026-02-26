/**
 * pythonRunner.ts — Execute Python code client-side using Pyodide (CPython
 * compiled to WASM) inside a Web Worker.
 *
 * Pyodide is loaded from CDN inside the Worker on first execution. A strict
 * 3-second timeout prevents infinite loops from freezing the UI — the Worker
 * is forcefully terminated and a fresh one is created for the next run.
 */

import type { ExecutionResult } from '../wasmExecutor';

const EXECUTION_TIMEOUT_MS = 3000;

export async function executePython(code: string, input: string): Promise<ExecutionResult> {
  return new Promise<ExecutionResult>((resolve) => {
    const workerCode = buildPythonWorkerCode(code, input);
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    let resolved = false;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    };

    // Strict 3-second timeout — terminates worker and returns error
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        cleanup();
        resolve({
          stdout: '',
          stderr: 'Error: Timeout Excedido — La ejecución superó el límite de 3 segundos. Revisa si tu código tiene un bucle infinito.',
          error: 'Timeout Excedido',
          executionTime: EXECUTION_TIMEOUT_MS,
        });
      }
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'result') {
        clearTimeout(timeoutId);
        cleanup();
        resolve({
          stdout: msg.stdout || '',
          stderr: msg.stderr || '',
          error: msg.error || null,
          executionTime: 0,
        });
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timeoutId);
      cleanup();
      resolve({
        stdout: '',
        stderr: e.message || 'Worker error',
        error: e.message || 'Worker error',
        executionTime: 0,
      });
    };
  });
}

function buildPythonWorkerCode(userCode: string, input: string): string {
  // Embed user code and input as JSON literals, then reference them inside
  // the Python wrapper. This avoids nested template-literal escaping issues.
  const codeJson = JSON.stringify(userCode);
  const inputJson = JSON.stringify(input);

  return `
'use strict';

importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

async function main() {
  try {
    var pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });

    var userCode = ${codeJson};
    var userInput = ${inputJson};

    var wrapper =
      'import sys, io\\n' +
      'sys.stdin = io.StringIO(' + JSON.stringify(userInput) + ')\\n' +
      '__out = io.StringIO()\\n' +
      '__err = io.StringIO()\\n' +
      'sys.stdout = __out\\n' +
      'sys.stderr = __err\\n' +
      'try:\\n' +
      '    exec(' + JSON.stringify(userCode) + ', {"__builtins__": __builtins__})\\n' +
      'except Exception as __e:\\n' +
      '    print(str(__e), file=__err)\\n' +
      'finally:\\n' +
      '    sys.stdout = sys.__stdout__\\n' +
      '    sys.stderr = sys.__stderr__\\n' +
      '(__out.getvalue(), __err.getvalue())';

    var result = pyodide.runPython(wrapper).toJs();
    var stdout = result[0] || '';
    var stderr = result[1] || '';

    self.postMessage({
      type: 'result',
      stdout: stdout,
      stderr: stderr,
      error: stderr || null
    });
  } catch (err) {
    var msg = err && err.message ? err.message : String(err);
    self.postMessage({ type: 'result', stdout: '', stderr: msg, error: msg });
  }
}

main();
`;
}
