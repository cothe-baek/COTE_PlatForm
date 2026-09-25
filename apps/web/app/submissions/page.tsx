'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DifficultyBadge, VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { api, LANGUAGE_LABEL, type Paged, type SubmissionRow } from '@/lib/api';

function SubmissionsInner() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<SubmissionRow> | null>(null);
  useEffect(() => {
    api<Paged<SubmissionRow>>(`/submissions?page=${page}`).then(setData);
  }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">제출 이력</h1>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">시각</th>
              <th className="px-4 py-2 font-medium">문제</th>
              <th className="px-4 py-2 font-medium">언어</th>
              <th className="px-4 py-2 font-medium">결과</th>
              <th className="px-4 py-2 text-right font-medium">통과</th>
              <th className="px-4 py-2 text-right font-medium">시간</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!data ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">불러오는 중…</td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">아직 제출이 없습니다</td>
              </tr>
            ) : (
              data.items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    <Link href={`/submissions/${s.id}`} className="hover:underline">{new Date(s.createdAt).toLocaleString('ko-KR')}</Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/problems/${s.problem.id}`} className="hover:underline">{s.problem.title}</Link>{' '}
                    <DifficultyBadge level={s.problem.difficulty} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{LANGUAGE_LABEL[s.language]}</td>
                  <td className="px-4 py-2.5"><VerdictBadge verdict={s.status} /></td>
                  <td className="px-4 py-2.5 text-right text-slate-500">{s.passedCount}/{s.totalCount}</td>
                  <td className="px-4 py-2.5 text-right text-slate-500">{s.execTimeMs ?? '-'}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {data && data.total > data.pageSize && (
        <div className="flex justify-center gap-2 text-sm">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">이전</button>
          <span className="px-2 py-1 text-slate-500">{page} / {Math.ceil(data.total / data.pageSize)}</span>
          <button disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">다음</button>
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <RequireAuth>
      <SubmissionsInner />
    </RequireAuth>
  );
}
