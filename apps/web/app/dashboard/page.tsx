'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { api, tagLabel, type Dashboard, type ReviewNote } from '@/lib/api';

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function DashboardInner() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [due, setDue] = useState<ReviewNote[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api<Dashboard>('/dashboard'), api<ReviewNote[]>('/review/due')])
      .then(([d, r]) => {
        setData(d);
        setDue(r);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">대시보드</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="오늘 푼 문제" value={data.todaySolved} />
        <Stat label="연속 풀이" value={`${data.streak}일`} />
        <Stat label="해결한 문제" value={`${data.solvedCount} / ${data.totalProblems}`} sub={`시도 ${data.triedCount}문제 · 제출 ${data.submissionCount}회`} />
        <Stat label="복습 대기" value={data.reviewTodo} sub="오답노트에서 미해결" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">오늘의 복습</h2>
            <Link href="/review" className="text-xs text-slate-500 hover:underline">
              오답노트 전체
            </Link>
          </div>
          {due.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">오늘 복습할 문제가 없습니다. 새 문제를 풀어보세요.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {due.map((n) => (
                <li key={n.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/problems/${n.problem.id}`} className="hover:underline">
                    {n.problem.title}
                  </Link>
                  <span className="text-xs text-slate-400">{n.failCount}회 실패</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">유형별 진행률</h2>
          <ul className="mt-3 space-y-2">
            {data.tagStats.map((t) => {
              const pct = t.total ? Math.round((t.solved / t.total) * 100) : 0;
              return (
                <li key={t.tag} className="text-sm">
                  <div className="flex justify-between">
                    <Link href={`/problems?tag=${t.tag}`} className="hover:underline">
                      {tagLabel(t.tag)}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {t.solved}/{t.total} 해결{t.tried > t.solved ? ` · ${t.tried - t.solved} 시도 중` : ''}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded bg-slate-100">
                    <div className="h-1.5 rounded bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">최근 제출</h2>
          <Link href="/submissions" className="text-xs text-slate-500 hover:underline">
            전체 보기
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            아직 제출이 없습니다. <Link href="/problems" className="underline">문제 풀러 가기</Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {data.recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/submissions/${s.id}`} className="hover:underline">
                  {s.problem.title}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString('ko-KR')}</span>
                  <VerdictBadge verdict={s.status} short />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
