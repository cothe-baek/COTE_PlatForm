'use client';

import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LevelTag, ReviewStateTag, TagChip, VerdictBadge } from '@/components/badges';
import { RequireAuth } from '@/components/require-auth';
import { Button, Card, LinkButton, Loading, SectionTitle } from '@/components/ui';
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

  if (error) return <p className="text-error">{error}</p>;
  if (!note) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/review" className="rounded-md p-1.5 text-fg-2 hover:bg-fill hover:text-fg" aria-label="오답노트로">
          <ArrowLeft size={18} />
        </Link>
        <LevelTag level={note.problem.difficulty} />
        <h1 className="text-xl font-bold">{note.problem.title}</h1>
        <ReviewStateTag state={note.state} />
        {note.problem.tags.map((t) => (
          <TagChip key={t} tag={t} label={tagLabel(t)} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <p className="text-sm text-fg-2">
            {note.failCount}회 실패 · 복습 {note.reviewCount}회
            {note.nextReviewAt && note.state !== 'DONE' ? ` · 다음 복습 ${new Date(note.nextReviewAt).toLocaleDateString('ko-KR')}` : ''}
          </p>
          <label className="block text-sm font-semibold">
            메모 <span className="font-normal text-fg-3">— 틀린 이유, 핵심 아이디어, 놓친 엣지케이스</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={10}
              className="mt-1.5 w-full rounded-md border border-border bg-surface p-3 text-sm font-normal leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
              placeholder="예) 방문 배열을 큐에 넣을 때가 아니라 꺼낼 때 체크해서 중복 방문이 생겼다."
            />
          </label>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={save} disabled={saved === 'saving'}>
              {saved === 'saving' ? '저장 중…' : '메모 저장'}
            </Button>
            {saved === 'saved' && <span className="text-xs text-success">저장됨</span>}
            <LinkButton href={`/problems/${note.problem.id}`} variant="success" className="ml-auto">
              <Play size={14} /> 다시 풀기
            </LinkButton>
          </div>
        </Card>
        <Card>
          <SectionTitle>이 문제 제출 이력</SectionTitle>
          <ul className="mt-2 divide-y divide-border-soft text-sm">
            {note.submissions?.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5">
                <Link href={`/submissions/${s.id}`} className="text-xs text-fg-2 hover:text-primary">
                  {new Date(s.createdAt).toLocaleString('ko-KR')} · {LANGUAGE_LABEL[s.language]}
                </Link>
                <VerdictBadge verdict={s.status} short />
              </li>
            ))}
          </ul>
        </Card>
      </div>
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
