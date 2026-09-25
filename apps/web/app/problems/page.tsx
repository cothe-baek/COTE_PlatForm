'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { DifficultyBadge, StatusDot, TagChip } from '@/components/badges';
import { api, tagLabel, type Paged, type ProblemSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';

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

  const select = 'rounded border border-slate-300 bg-white px-2 py-1.5 text-sm';
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">문제</h1>
      <div className="flex flex-wrap items-center gap-2">
        <select value={tag} onChange={(e) => setParam('tag', e.target.value)} className={select}>
          <option value="">모든 유형</option>
          {tags.map((t) => (
            <option key={t.tag} value={t.tag}>
              {tagLabel(t.tag)} ({t.count})
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setParam('difficulty', e.target.value)} className={select}>
          <option value="">모든 난이도</option>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>
              Lv.{d}
            </option>
          ))}
        </select>
        {user && (
          <select value={status} onChange={(e) => setParam('status', e.target.value)} className={select}>
            <option value="">모든 상태</option>
            <option value="unsolved">미풀이</option>
            <option value="tried">시도 중</option>
            <option value="solved">해결</option>
          </select>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', q);
          }}
          className="flex gap-1"
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="제목 검색" className={select} />
          <button className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white">검색</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">상태</th>
              <th className="px-4 py-2 font-medium">제목</th>
              <th className="px-4 py-2 font-medium">유형</th>
              <th className="px-4 py-2 font-medium">난이도</th>
              <th className="px-4 py-2 text-right font-medium">정답률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!data ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  불러오는 중…
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  조건에 맞는 문제가 없습니다
                </td>
              </tr>
            ) : (
              data.items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <StatusDot status={p.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/problems/${p.id}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <TagChip key={t} tag={t} label={tagLabel(t)} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <DifficultyBadge level={p.difficulty} />
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500">
                    {p.submitCount ? `${Math.round((p.acCount / p.submitCount) * 100)}%` : '-'}
                    <span className="ml-1 text-xs text-slate-400">({p.submitCount})</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
              className={`rounded px-3 py-1 ${String(n) === page ? 'bg-slate-900 text-white' : 'border border-slate-300'}`}
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
    <Suspense fallback={<p className="text-sm text-slate-500">불러오는 중…</p>}>
      <ProblemsInner />
    </Suspense>
  );
}
