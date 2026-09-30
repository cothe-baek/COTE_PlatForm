'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LevelTag, REVIEW_STATE_LABEL as STATE_LABEL, ReviewStateTag, TagChip } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { Card, Empty, Loading, PageTitle } from '@/components/ui';
import { api, tagLabel, type ReviewNote, type ReviewState } from '@/lib/api';

function ReviewInner() {
  const [filter, setFilter] = useState<ReviewState | ''>('');
  const [notes, setNotes] = useState<ReviewNote[] | null>(null);
  useEffect(() => {
    api<ReviewNote[]>(`/review${filter ? `?state=${filter}` : ''}`).then(setNotes);
  }, [filter]);

  return (
    <div className="space-y-5">
      <PageTitle
        title="오답노트"
        subtitle="틀린 제출은 자동으로 여기에 쌓입니다. 다시 풀어 정답을 받으면 해결로 바뀝니다."
        action={
          <div className="inline-flex rounded-md bg-fill p-0.5 text-sm">
            {(['', 'TODO', 'REVIEWING', 'DONE'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-[7px] px-3 py-1 text-xs font-medium transition ${filter === s ? 'bg-surface text-fg shadow-sm' : 'text-fg-2 hover:text-fg'}`}
              >
                {s ? STATE_LABEL[s] : '전체'}
              </button>
            ))}
          </div>
        }
      />
      {!notes ? (
        <Loading />
      ) : notes.length === 0 ? (
        <Empty>
          오답노트가 비어 있습니다.{' '}
          <Link href="/problems" className="font-medium text-primary hover:underline">
            문제를 풀어보세요
          </Link>
        </Empty>
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border-soft">
            {notes.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <LevelTag level={n.problem.difficulty} />
                    <Link href={`/review/${n.id}`} className="font-bold hover:text-primary">
                      {n.problem.title}
                    </Link>
                    {n.problem.tags.map((t) => (
                      <TagChip key={t} tag={t} label={tagLabel(t)} />
                    ))}
                  </div>
                  <p className="truncate text-xs text-fg-2">
                    {n.failCount}회 실패{n.memo ? ` · ${n.memo}` : ' · 메모 없음'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {n.nextReviewAt && n.state !== 'DONE' && <span className="text-xs text-fg-3">복습 {new Date(n.nextReviewAt).toLocaleDateString('ko-KR')}</span>}
                  <ReviewStateTag state={n.state} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
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
