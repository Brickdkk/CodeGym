/**
 * pythonRunner.ts — Execute Python code client-side using Pyodide (CPython
 * compiled to WASM) inside a Web Worker.
 *
 * Pyodide is loaded from CDN inside the Worker on first execution. A strict
 * 3-second timeout prevents infinite loops from freezing the UI — the Worker
 * is forcefully terminated and a fresh one is created for the next run.
 *
 * The timeout applies ONLY to user-code execution, NOT to the initial Pyodide
 * download (~12 MB WASM, cached by the browser after first load).
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
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        if (timeoutId !== null) clearTimeout(timeoutId);
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    };

    worker.onmessage = (e) => {
      const msg = e.data;

      if (msg.type === 'ready') {
        // Pyodide loaded — NOW start the execution timeout
        timeoutId = setTimeout(() => {
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
        return;
      }

      if (msg.type === 'result') {
        cleanup();
        resolve({
          stdout: msg.stdout || '',
          stderr: msg.stderr || '',
          error: msg.error || null,
          executionTime: 0,
        });
        return;
      }

      if (msg.type === 'load-error') {
        cleanup();
        resolve({
          stdout: '',
          stderr: msg.error || 'Error al cargar Pyodide',
          error: msg.error || 'Error al cargar Pyodide',
          executionTime: 0,
        });
      }
    };

    worker.onerror = (e) => {
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
  const codeJson = JSON.stringify(userCode);
  const inputJson = JSON.stringify(input);

  return `
'use strict';

importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

async function main() {
  var pyodide;
  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });
  } catch (err) {
    var loadMsg = err && err.message ? err.message : String(err);
    self.postMessage({ type: 'load-error', error: loadMsg });
    return;
  }

  // Signal that Pyodide is ready — main thread starts timeout NOW
  self.postMessage({ type: 'ready' });

  try {
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
