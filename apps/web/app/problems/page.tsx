'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { LevelTag, StatusLabel, TagChip } from '@/components/badges';
import { Button, Card, Empty, Input, Loading, PageTitle, Select } from '@/components/ui';
import { api, tagLabel, type Paged, type ProblemSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';

function ProblemCard({ p }: { p: ProblemSummary }) {
  const rate = p.submitCount ? Math.round((p.acCount / p.submitCount) * 100) : null;
  return (
    <Link href={`/problems/${p.id}`} className="block h-full">
      <Card className="flex h-full flex-col gap-2.5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
        <div className="flex items-center justify-between">
          <LevelTag level={p.difficulty} />
          {p.status !== 'unsolved' && <StatusLabel status={p.status} />}
        </div>
        <h3 className="text-base font-bold leading-snug">{p.title}</h3>
        <div className="flex flex-wrap gap-1">
          {p.tags.map((t) => (
            <TagChip key={t} tag={t} label={tagLabel(t)} />
          ))}
        </div>
        <p className="mt-auto pt-1 text-xs text-fg-2">
          완료한 사람 {p.solvedUserCount.toLocaleString()}명 · 정답률 {rate === null ? '-' : `${rate}%`}
        </p>
      </Card>
    </Link>
  );
}

function ProblemsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState<Paged<ProblemSummary> | null>(null);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [q, setQ] = useState(params.get('q') ?? '');

  const tag = params.get('tag') ?? '';
  const difficulty = params.get('difficulty') ?? '';
  const status = params.get('status') ?? '';
  const page = params.get('page') ?? '1';

  useEffect(() => {
    api<{ tag: string; count: number }[]>('/problems/tags').then(setTags);
  }, []);

  useEffect(() => {
    if (loading) return; // 로그인 상태가 확정된 뒤 풀이 상태를 포함해 불러온다
    const qs = new URLSearchParams();
    if (tag) qs.set('tag', tag);
    if (difficulty) qs.set('difficulty', difficulty);
    if (status && user) qs.set('status', status);
    if (params.get('q')) qs.set('q', params.get('q')!);
    qs.set('page', page);
    api<Paged<ProblemSummary>>(`/problems?${qs}`).then(setData);
  }, [tag, difficulty, status, page, params, loading, user]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.push(`/problems?${next}`);
  }

  return (
    <div className="space-y-5">
      <PageTitle title="문제" subtitle="풀고 싶은 문제를 골라 보세요." />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={tag} onChange={(e) => setParam('tag', e.target.value)}>
          <option value="">모든 유형</option>
          {tags.map((t) => (
            <option key={t.tag} value={t.tag}>
              {tagLabel(t.tag)} ({t.count})
            </option>
          ))}
        </Select>
        <Select value={difficulty} onChange={(e) => setParam('difficulty', e.target.value)}>
          <option value="">모든 난이도</option>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>
              Lv.{d}
            </option>
          ))}
        </Select>
        {user && (
          <Select value={status} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">모든 상태</option>
            <option value="unsolved">미풀이</option>
            <option value="tried">시도함</option>
            <option value="solved">해결</option>
          </Select>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', q);
          }}
          className="flex gap-1.5"
        >
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목 검색" />
          <Button variant="primary" className="px-3" aria-label="검색">
            <Search size={16} />
          </Button>
        </form>
      </div>

      {!data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <Empty>조건에 맞는 문제가 없습니다</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => (
            <ProblemCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex justify-center gap-2 text-sm">
          {Array.from({ length: Math.ceil(data.total / data.pageSize) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                next.set('page', String(n));
                router.push(`/problems?${next}`);
              }}
              className={`rounded-md px-3 py-1 ${String(n) === page ? 'bg-primary text-primary-fg' : 'border border-border'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProblemsInner />
    </Suspense>
  );
}
