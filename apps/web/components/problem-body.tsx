'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ProblemBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose-problem text-sm text-slate-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
