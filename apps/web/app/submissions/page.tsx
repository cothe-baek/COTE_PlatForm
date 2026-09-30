'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LevelTag, VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { Button, Card, Loading, PageTitle } from '@/components/ui';
import { api, LANGUAGE_LABEL, type Paged, type SubmissionRow } from '@/lib/api';

const th = 'px-4 py-2.5 text-left text-xs font-semibold text-fg-2';
const td = 'px-4 py-3';

function SubmissionsInner() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paged<SubmissionRow> | null>(null);
  useEffect(() => {
    api<Paged<SubmissionRow>>(`/submissions?page=${page}`).then(setData);
  }, [page]);

  return (
    <div className="space-y-5">
      <PageTitle title="제출 이력" subtitle="최종 제출만 표시됩니다. 예제 실행은 포함되지 않습니다." />
      <Card padded={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-fill">
            <tr>
              <th className={th}>시각</th>
              <th className={th}>문제</th>
              <th className={th}>언어</th>
              <th className={th}>결과</th>
              <th className={`${th} text-right`}>통과</th>
              <th className={`${th} text-right`}>시간</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {!data ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-3">불러오는 중…</td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-fg-3">아직 제출이 없습니다</td>
              </tr>
            ) : (
              data.items.map((s) => (
                <tr key={s.id} className="transition hover:bg-fill/60">
                  <td className={`${td} text-xs text-fg-2`}>
                    <Link href={`/submissions/${s.id}`} className="hover:text-primary">{new Date(s.createdAt).toLocaleString('ko-KR')}</Link>
                  </td>
                  <td className={td}>
                    <span className="mr-2"><LevelTag level={s.problem.difficulty} /></span>
                    <Link href={`/problems/${s.problem.id}`} className="font-medium hover:text-primary">{s.problem.title}</Link>
                  </td>
                  <td className={`${td} text-fg-2`}>{LANGUAGE_LABEL[s.language]}</td>
                  <td className={td}><VerdictBadge verdict={s.status} /></td>
                  <td className={`${td} text-right text-fg-2`}>{s.passedCount}/{s.totalCount}</td>
                  <td className={`${td} text-right font-mono text-xs text-fg-2`}>{s.execTimeMs ?? '-'}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>이전</Button>
          <span className="px-2 text-fg-2">{page} / {Math.ceil(data.total / data.pageSize)}</span>
          <Button disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)}>다음</Button>
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
