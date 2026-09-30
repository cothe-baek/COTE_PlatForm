'use client';

import { Flame } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { Card, Loading, PageTitle, SectionTitle } from '@/components/ui';
import { api, tagLabel, type Dashboard, type ReviewNote } from '@/lib/api';

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <Card>
      <p className="text-xs font-medium text-fg-2">{label}</p>
      <p className={`mt-1.5 text-3xl font-extrabold tracking-tight ${accent ? 'text-primary' : ''}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-fg-3">{sub}</p>}
    </Card>
  );
}

const linkCls = 'text-xs font-medium text-primary hover:underline';

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

  if (error) return <p className="text-error">{error}</p>;
  if (!data) return <Loading />;

  return (
    <div className="space-y-6">
      <PageTitle title="대시보드" subtitle="오늘의 진행 상황과 복습할 문제입니다." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="오늘 푼 문제" value={data.todaySolved} accent />
        <Stat label="연속 풀이" value={`${data.streak}일`} sub={data.streak > 0 ? '🔥 계속 이어가세요' : '오늘 한 문제로 시작해 보세요'} />
        <Stat label="해결한 문제" value={`${data.solvedCount} / ${data.totalProblems}`} sub={`시도 ${data.triedCount}문제 · 제출 ${data.submissionCount}회`} />
        <Stat label="복습 대기" value={data.reviewTodo} sub="오답노트에서 미해결" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle
            action={
              <Link href="/review" className={linkCls}>
                오답노트 전체
              </Link>
            }
          >
            오늘의 복습
          </SectionTitle>
          {due.length === 0 ? (
            <p className="mt-4 text-sm text-fg-2">오늘 복습할 문제가 없습니다. 새 문제를 풀어보세요.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border-soft">
              {due.map((n) => (
                <li key={n.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/problems/${n.problem.id}`} className="font-medium hover:text-primary">
                    {n.problem.title}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-xs text-warning">
                    <Flame size={12} /> {n.failCount}회 실패
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle>유형별 진행률</SectionTitle>
          <ul className="mt-3 space-y-2.5">
            {data.tagStats.map((t) => {
              const pct = t.total ? Math.round((t.solved / t.total) * 100) : 0;
              return (
                <li key={t.tag} className="text-sm">
                  <div className="flex justify-between">
                    <Link href={`/problems?tag=${t.tag}`} className="font-medium hover:text-primary">
                      {tagLabel(t.tag)}
                    </Link>
                    <span className="text-xs text-fg-2">
                      {t.solved}/{t.total} 해결{t.tried > t.solved ? ` · ${t.tried - t.solved} 시도 중` : ''}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-fill">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <SectionTitle
          action={
            <Link href="/submissions" className={linkCls}>
              전체 보기
            </Link>
          }
        >
          최근 제출
        </SectionTitle>
        {data.recent.length === 0 ? (
          <p className="mt-4 text-sm text-fg-2">
            아직 제출이 없습니다.{' '}
            <Link href="/problems" className="font-medium text-primary hover:underline">
              문제 풀러 가기
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border-soft">
            {data.recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <Link href={`/submissions/${s.id}`} className="font-medium hover:text-primary">
                  {s.problem.title}
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-fg-3">{new Date(s.createdAt).toLocaleString('ko-KR')}</span>
                  <VerdictBadge verdict={s.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
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
