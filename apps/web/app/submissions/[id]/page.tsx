'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VERDICT_LABEL, VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { Card, Loading } from '@/components/ui';
import { api, LANGUAGE_LABEL, type SubmissionDetail } from '@/lib/api';

function SubmissionInner() {
  const { id } = useParams<{ id: string }>();
  const [s, setS] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<SubmissionDetail>(`/submissions/${id}`).then(setS).catch((e) => setError(e.message));
  }, [id]);
  if (error) return <p className="text-error">{error}</p>;
  if (!s) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/submissions" className="rounded-md p-1.5 text-fg-2 hover:bg-fill hover:text-fg" aria-label="제출 이력으로">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold">
          <Link href={`/problems/${s.problem.id}`} className="hover:text-primary">{s.problem.title}</Link>
        </h1>
        <VerdictBadge verdict={s.status} />
        <span className="text-sm text-fg-2">
          {LANGUAGE_LABEL[s.language]} · {s.passedCount}/{s.totalCount} 통과 · {s.execTimeMs ?? 0}ms · {new Date(s.createdAt).toLocaleString('ko-KR')}
        </span>
      </div>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {s.results.map((r) => (
            <span key={r.order} title={`${VERDICT_LABEL[r.verdict]} · ${r.execTimeMs}ms`} className={`h-6 w-6 rounded-md text-center text-xs font-semibold leading-6 text-white ${r.verdict === 'AC' ? 'bg-success' : 'bg-error'}`}>
              {r.order}
            </span>
          ))}
          {Array.from({ length: s.totalCount - s.results.length }, (_, i) => (
            <span key={`skip-${i}`} className="h-6 w-6 rounded-md bg-fill text-center text-xs leading-6 text-fg-3">·</span>
          ))}
        </div>
        {s.compileLog && s.status === 'CE' && <pre className="code-block max-h-56 overflow-auto text-error">{s.compileLog}</pre>}
        {s.results.some((r) => r.stderr) && <pre className="code-block max-h-40 overflow-auto text-error">{s.results.find((r) => r.stderr)?.stderr}</pre>}
      </Card>
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-border-soft px-4 py-2.5 font-mono text-sm font-semibold">{LANGUAGE_LABEL[s.language]}</div>
        <pre className="overflow-auto p-4 font-mono text-sm leading-6">{s.code}</pre>
      </Card>
    </div>
  );
}

export default function SubmissionPage() {
  return (
    <RequireAuth>
      <SubmissionInner />
    </RequireAuth>
  );
}
