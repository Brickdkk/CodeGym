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
    // Sandbox WITHOUT allow-same-origin — prevents script execution and
    // blocks access to parent page. Using srcdoc instead of doc.write().
    iframe.setAttribute('sandbox', '');

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
        // With sandbox="" (no allow-same-origin), we cannot access
        // contentDocument directly. Instead, use a DOMParser to extract
        // text from the HTML string — this is safe and doesn't execute scripts.
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
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

    // Use srcdoc attribute instead of doc.write() — safer, no DOM access needed
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}
