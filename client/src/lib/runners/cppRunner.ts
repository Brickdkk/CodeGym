/**
 * cppRunner.ts — Execute C/C++ code client-side using JSCPP interpreter
 * inside a Web Worker to prevent main-thread freezes.
 *
 * JSCPP is a pure-JS interpreter for a subset of C/C++. The interpreter is
 * loaded inside a dedicated Worker and forcefully terminated after a strict
 * 3-second timeout to prevent DoS from infinite loops.
 */

import type { ExecutionResult } from '../wasmExecutor';

const EXECUTION_TIMEOUT_MS = 3000;

export async function executeCpp(code: string, input: string): Promise<ExecutionResult> {
  return new Promise<ExecutionResult>((resolve) => {
    // Build a self-contained Worker that imports JSCPP via importScripts/CDN
    // and runs the user code inside it.
    const workerCode = buildCppWorkerCode(code, input);
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

function buildCppWorkerCode(userCode: string, input: string): string {
  // We load JSCPP from a CDN inside the Worker since dynamic imports of npm
  // modules aren't available in blob-URL workers. The JSCPP UMD build
  // exposes `JSCPP` as a global.
  return `
'use strict';

importScripts('https://cdn.jsdelivr.net/npm/JSCPP@2.1.2/dist/JSCPP.es5.min.js');

try {
  var stdout = '';
  var config = {
    stdio: {
      write: function(s) {
        stdout += s;
      }
    },
    input: ${JSON.stringify(input)},
    unsigned_overflow: 'warn'
  };

  JSCPP.run(${JSON.stringify(userCode)}, ${JSON.stringify(input)}, config);

  self.postMessage({ type: 'result', stdout: stdout, stderr: '', error: null });
} catch (err) {
  var msg = err && err.message ? err.message : String(err);
  self.postMessage({ type: 'result', stdout: '', stderr: msg, error: msg });
}
`;
}
