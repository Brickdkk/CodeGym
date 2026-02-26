/**
 * htmlRunner.ts — Render HTML/CSS code in a sandboxed iframe and extract visible text.
 *
 * For HTML/CSS exercises the "output" is typically the visible text content of
 * the rendered page, or specific DOM properties. The iframe is created
 * off-screen with `sandbox` to prevent scripts from escaping.
 */

import type { ExecutionResult } from '../wasmExecutor';

export async function executeHtmlCss(code: string): Promise<ExecutionResult> {
  let stdout = '';
  let stderr = '';
  let error: string | null = null;

  try {
    stdout = await renderInIframe(code);
  } catch (err: any) {
    error = err?.message || String(err);
    stderr = error!;
  }

  return { stdout, stderr, error, executionTime: 0 };
}

function renderInIframe(html: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '768px';
    iframe.setAttribute('sandbox', 'allow-same-origin');

    // Unique message channel for this render
    const channel = new MessageChannel();

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('HTML render timed out'));
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) {
          cleanup();
          resolve('');
          return;
        }

        // Extract visible text content — this is what test cases compare against.
        // For more granular assertions (element existence, CSS properties, etc.),
        // the test runner can query the iframe DOM directly.
        const text = doc.body?.innerText || doc.body?.textContent || '';
        cleanup();
        resolve(text.trim());
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error('Failed to load iframe'));
    };

    document.body.appendChild(iframe);

    // Write HTML content into the iframe
    const doc = iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    } else {
      cleanup();
      reject(new Error('Cannot access iframe document'));
    }
  });
}
