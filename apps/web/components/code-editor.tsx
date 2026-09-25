'use client';

import dynamic from 'next/dynamic';
import type { Language } from '@/lib/api';

const Monaco = dynamic(() => import('./monaco-setup').then(() => import('@monaco-editor/react')), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-50 p-4 text-sm text-slate-400">에디터 로딩 중…</div>,
});

const MONACO_LANG: Record<Language, string> = { PYTHON: 'python', JAVASCRIPT: 'javascript', CPP: 'cpp', JAVA: 'java' };

export const TEMPLATES: Record<Language, string> = {
  PYTHON: 'import sys\ninput = sys.stdin.readline\n\n',
  JAVASCRIPT: "const input = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\n\n",
  CPP: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    return 0;\n}\n',
  JAVA: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n    }\n}\n',
};

export function CodeEditor({ language, value, onChange }: { language: Language; value: string; onChange: (v: string) => void }) {
  return (
    <Monaco
      height="100%"
      language={MONACO_LANG[language]}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      theme="vs-dark"
      options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, tabSize: 4, automaticLayout: true }}
    />
  );
}
