'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DifficultyBadge, TagChip } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { api, tagLabel, type ReviewNote, type ReviewState } from '@/lib/api';

const STATE_LABEL: Record<ReviewState, string> = { TODO: '복습 필요', REVIEWING: '재도전 중', DONE: '해결' };
const STATE_STYLE: Record<ReviewState, string> = {
  TODO: 'bg-red-100 text-red-700',
  REVIEWING: 'bg-amber-100 text-amber-700',
  DONE: 'bg-emerald-100 text-emerald-700',
};

function ReviewInner() {
  const [filter, setFilter] = useState<ReviewState | ''>('');
  const [notes, setNotes] = useState<ReviewNote[] | null>(null);
  useEffect(() => {
    api<ReviewNote[]>(`/review${filter ? `?state=${filter}` : ''}`).then(setNotes);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">오답노트</h1>
        <div className="flex gap-1 text-sm">
          {(['', 'TODO', 'REVIEWING', 'DONE'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded px-3 py-1 ${filter === s ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white'}`}>
              {s ? STATE_LABEL[s] : '전체'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-500">틀린 제출은 자동으로 여기에 쌓입니다. 다시 풀어 정답을 받으면 해결로 바뀝니다.</p>
      {!notes ? (
        <p className="text-sm text-slate-500">불러오는 중…</p>
      ) : notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          오답노트가 비어 있습니다. <Link href="/problems" className="underline">문제를 풀어보세요</Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {notes.map((n) => (
            <li key={n.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link href={`/review/${n.id}`} className="font-medium hover:underline">{n.problem.title}</Link>
                  <DifficultyBadge level={n.problem.difficulty} />
                  {n.problem.tags.map((t) => <TagChip key={t} tag={t} label={tagLabel(t)} />)}
                </div>
                <p className="text-xs text-slate-500">
                  {n.failCount}회 실패{n.memo ? ` · ${n.memo.slice(0, 60)}${n.memo.length > 60 ? '…' : ''}` : ' · 메모 없음'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {n.nextReviewAt && n.state !== 'DONE' && (
                  <span className="text-xs text-slate-400">복습 {new Date(n.nextReviewAt).toLocaleDateString('ko-KR')}</span>
                )}
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATE_STYLE[n.state]}`}>{STATE_LABEL[n.state]}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <RequireAuth>
      <ReviewInner />
    </RequireAuth>
  );
}
