import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '300px',
  readOnly = false 
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'javascript':
      case 'js':
        return javascript();
      case 'python':
      case 'py':
        return python();
      case 'cpp':
      case 'c++':
      case 'c':
        return cpp();
      case 'html':
        return html();
      case 'css':
        return css();
      default:
        return javascript();
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      getLanguageExtension(language),
      oneDark,
      EditorView.theme({
        '&': {
          height: height,
        },
        '.cm-content': {
          padding: '1rem',
          fontSize: '14px',
          fontFamily: 'JetBrains Mono, monospace',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          borderRadius: '0.5rem',
        },
        '.cm-scroller': {
          fontFamily: 'JetBrains Mono, monospace',
        }
      }),
      EditorView.lineWrapping,
    ];

    if (!readOnly) {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        })
      );
    }

    const view = new EditorView({
      doc: value,
      extensions,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, height, readOnly]);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className="relative">
      <div 
        ref={editorRef} 
        className="border border-border rounded-lg overflow-hidden"
        style={{ height }}
      />
    </div>
  );
}
