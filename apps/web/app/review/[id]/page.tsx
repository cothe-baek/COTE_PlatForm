'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DifficultyBadge, TagChip, VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { api, LANGUAGE_LABEL, tagLabel, type ReviewNote } from '@/lib/api';

function ReviewDetailInner() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<ReviewNote | null>(null);
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ReviewNote>(`/review/${id}`)
      .then((n) => {
        setNote(n);
        setMemo(n.memo);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function save() {
    setSaved('saving');
    try {
      const n = await api<ReviewNote>(`/review/${id}`, { method: 'PATCH', json: { memo } });
      setNote((prev) => (prev ? { ...prev, ...n, submissions: prev.submissions } : n));
      setSaved('saved');
      setTimeout(() => setSaved('idle'), 1500);
    } catch (e) {
      setSaved('idle');
      setError(e instanceof Error ? e.message : '저장 실패');
    }
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!note) return <p className="text-sm text-slate-500">불러오는 중…</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="space-y-3 lg:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{note.problem.title}</h1>
          <DifficultyBadge level={note.problem.difficulty} />
          {note.problem.tags.map((t) => <TagChip key={t} tag={t} label={tagLabel(t)} />)}
        </div>
        <p className="text-sm text-slate-500">
          {note.failCount}회 실패 · 복습 {note.reviewCount}회 · 상태 {note.state}
          {note.nextReviewAt && note.state !== 'DONE' ? ` · 다음 복습 ${new Date(note.nextReviewAt).toLocaleDateString('ko-KR')}` : ''}
        </p>
        <label className="block text-sm font-medium">
          메모 <span className="font-normal text-slate-400">— 틀린 이유, 핵심 아이디어, 놓친 엣지케이스</span>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={10} className="mt-1 w-full rounded border border-slate-300 p-3 text-sm focus:border-slate-900 focus:outline-none" placeholder="예) 방문 배열을 큐에 넣을 때가 아니라 꺼낼 때 체크해서 중복 방문이 생겼다." />
        </label>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saved === 'saving'} className="rounded bg-slate-900 px-4 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
            {saved === 'saving' ? '저장 중…' : '메모 저장'}
          </button>
          {saved === 'saved' && <span className="text-xs text-emerald-600">저장됨</span>}
          <Link href={`/problems/${note.problem.id}`} className="ml-auto rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700">
            다시 풀기
          </Link>
        </div>
      </section>
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold">이 문제 제출 이력</h2>
        <ul className="mt-2 divide-y divide-slate-100 text-sm">
          {note.submissions?.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2">
              <Link href={`/submissions/${s.id}`} className="text-xs text-slate-500 hover:underline">
                {new Date(s.createdAt).toLocaleString('ko-KR')} · {LANGUAGE_LABEL[s.language]}
              </Link>
              <VerdictBadge verdict={s.status} short />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export default function ReviewDetailPage() {
  return (
    <RequireAuth>
      <ReviewDetailInner />
    </RequireAuth>
  );
}
