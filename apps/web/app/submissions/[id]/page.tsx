'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VERDICT_LABEL, VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { api, LANGUAGE_LABEL, type SubmissionDetail } from '@/lib/api';

function SubmissionInner() {
  const { id } = useParams<{ id: string }>();
  const [s, setS] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<SubmissionDetail>(`/submissions/${id}`).then(setS).catch((e) => setError(e.message));
  }, [id]);
  if (error) return <p className="text-red-600">{error}</p>;
  if (!s) return <p className="text-sm text-slate-500">불러오는 중…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">
          <Link href={`/problems/${s.problem.id}`} className="hover:underline">{s.problem.title}</Link>
        </h1>
        <VerdictBadge verdict={s.status} />
        <span className="text-sm text-slate-500">
          {LANGUAGE_LABEL[s.language]} · {s.passedCount}/{s.totalCount} 통과 · {s.execTimeMs ?? 0}ms · {new Date(s.createdAt).toLocaleString('ko-KR')}
        </span>
      </div>
      {s.compileLog && s.status === 'CE' && <pre className="overflow-auto rounded bg-slate-900 p-3 text-xs text-red-200">{s.compileLog}</pre>}
      <div className="flex flex-wrap gap-1">
        {s.results.map((r) => (
          <span key={r.order} title={`${VERDICT_LABEL[r.verdict]} · ${r.execTimeMs}ms`} className={`h-6 w-6 rounded text-center text-xs leading-6 text-white ${r.verdict === 'AC' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {r.order}
          </span>
        ))}
      </div>
      {s.results.some((r) => r.stderr) && (
        <pre className="overflow-auto rounded bg-slate-900 p-3 text-xs text-red-200">{s.results.find((r) => r.stderr)?.stderr}</pre>
      )}
      <pre className="overflow-auto rounded-lg border border-slate-200 bg-white p-4 text-sm">{s.code}</pre>
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
