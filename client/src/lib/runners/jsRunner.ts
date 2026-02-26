/**
 * jsRunner.ts — Execute JavaScript code client-side in a sandboxed Web Worker.
 *
 * User code runs inside a short-lived worker with `console.log` patched to
 * capture output. The worker is forcefully terminated after a strict 3-second
 * timeout to prevent DoS from infinite loops. stdin is simulated via a
 * pre-seeded array.
 */

import type { ExecutionResult } from '../wasmExecutor';

const EXECUTION_TIMEOUT_MS = 3000;

export async function executeJavaScript(code: string, input: string): Promise<ExecutionResult> {
  return new Promise<ExecutionResult>((resolve) => {
    const workerCode = buildWorkerCode(code, input);
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    let stdout = '';
    let stderr = '';
    let error: string | null = null;
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
          stdout: stdout.trimEnd(),
          stderr: 'Error: Timeout Excedido — La ejecución superó el límite de 3 segundos. Revisa si tu código tiene un bucle infinito.',
          error: 'Timeout Excedido',
          executionTime: EXECUTION_TIMEOUT_MS,
        });
      }
    }, EXECUTION_TIMEOUT_MS);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'stdout') {
        stdout += msg.data + '\n';
      } else if (msg.type === 'stderr') {
        stderr += msg.data + '\n';
        error = msg.data;
      } else if (msg.type === 'done') {
        clearTimeout(timeoutId);
        cleanup();
        resolve({ stdout: stdout.trimEnd(), stderr, error, executionTime: 0 });
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timeoutId);
      error = e.message || 'Worker error';
      stderr = error!;
      cleanup();
      resolve({ stdout, stderr, error, executionTime: 0 });
    };
  });
}

function buildWorkerCode(userCode: string, input: string): string {
  // The worker patches console.log/error/warn to capture output, provides
  // a simple prompt() shim for input, then evals the user code.
  return `
'use strict';

// Stdin simulation
const __inputLines = ${JSON.stringify(input.split('\n'))};
let __inputIdx = 0;

// Make prompt() available as a simple line reader
self.prompt = function(msg) {
  if (__inputIdx < __inputLines.length) {
    return __inputLines[__inputIdx++];
  }
  return '';
};

// readline-like helper
self.readline = self.prompt;

// Capture output
const __origLog = console.log;
console.log = function(...args) {
  const line = args.map(a => {
    if (typeof a === 'object') return JSON.stringify(a);
    return String(a);
  }).join(' ');
  self.postMessage({ type: 'stdout', data: line });
};
console.error = function(...args) {
  self.postMessage({ type: 'stderr', data: args.join(' ') });
};
console.warn = console.error;

try {
  ${userCode}
} catch (e) {
  self.postMessage({ type: 'stderr', data: e?.message || String(e) });
}

self.postMessage({ type: 'done' });
`;
}
