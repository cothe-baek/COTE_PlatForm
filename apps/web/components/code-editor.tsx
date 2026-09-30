'use client';

import dynamic from 'next/dynamic';
import type { Language } from '@/lib/api';
import { useTheme } from '@/lib/theme';

const Monaco = dynamic(() => import('./monaco-setup').then(() => import('@monaco-editor/react')), {
  ssr: false,
  loading: () => <div className="h-full bg-surface p-4 text-sm text-fg-3">에디터 로딩 중…</div>,
});

const MONACO_LANG: Record<Language, string> = { PYTHON: 'python', JAVASCRIPT: 'javascript', CPP: 'cpp', JAVA: 'java' };

export const TEMPLATES: Record<Language, string> = {
  PYTHON: 'import sys\ninput = sys.stdin.readline\n\n',
  JAVASCRIPT: "const input = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\n\n",
  CPP: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    return 0;\n}\n',
  JAVA: 'import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n\n    }\n}\n',
};

export function CodeEditor({ language, value, onChange }: { language: Language; value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme();
  return (
    <Monaco
      height="100%"
      language={MONACO_LANG[language]}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      theme={theme === 'dark' ? 'cote-dark' : 'cote-light'}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', D2Coding, Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 4,
        automaticLayout: true,
        padding: { top: 12, bottom: 12 },
        lineNumbersMinChars: 3,
        renderLineHighlight: 'line',
      }}
    />
  );
}
