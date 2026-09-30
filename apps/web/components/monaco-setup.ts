/**
 * Monaco 를 CDN 이 아닌 번들에서 로드하고, 디자인 토큰에 맞춘 라이트/다크 테마를 등록한다.
 * 문법 강조만 필요하므로 언어별 워커는 두지 않고 기본 에디터 워커만 등록한다.
 */
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// frontend/src/components/editorTheme.ts 의 구문 색과 동일
monaco.editor.defineTheme('cote-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '4F5BF5', fontStyle: 'bold' },
    { token: 'identifier', foreground: '15803D' },
    { token: 'type', foreground: '0E7490' },
    { token: 'string', foreground: '0F766E' },
    { token: 'number', foreground: 'C2410C' },
    { token: 'comment', foreground: '8A94A6', fontStyle: 'italic' },
    { token: 'delimiter', foreground: '475569' },
    { token: 'operator', foreground: '475569' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#111827',
    'editorLineNumber.foreground': '#9CA3AF',
    'editorLineNumber.activeForeground': '#6B7280',
    'editorCursor.foreground': '#4F5BF5',
    'editor.selectionBackground': '#4F5BF52E',
    'editor.lineHighlightBackground': '#F3F4F9',
    'editorIndentGuide.background1': '#ECEEF5',
  },
});

monaco.editor.defineTheme('cote-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '8FA0FF', fontStyle: 'bold' },
    { token: 'identifier', foreground: 'A6E3A1' },
    { token: 'type', foreground: '7FD1E0' },
    { token: 'string', foreground: 'F5B97F' },
    { token: 'number', foreground: 'FF8F8F' },
    { token: 'comment', foreground: '6B7F94', fontStyle: 'italic' },
    { token: 'delimiter', foreground: 'C8D3DD' },
    { token: 'operator', foreground: 'C8D3DD' },
  ],
  colors: {
    'editor.background': '#263747',
    'editor.foreground': '#E6EDF3',
    'editorLineNumber.foreground': '#7D8B99',
    'editorLineNumber.activeForeground': '#B2C0CC',
    'editorCursor.foreground': '#6D78F7',
    'editor.selectionBackground': '#6D78F759',
    'editor.lineHighlightBackground': '#1E2A3B',
    'editorIndentGuide.background1': '#3A4D60',
  },
});

if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url)),
  };
  loader.config({ monaco });
}
