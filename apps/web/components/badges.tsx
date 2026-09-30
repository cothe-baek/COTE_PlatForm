import { AlertCircle, CheckCircle2, Clock, Flame, RefreshCw, XCircle, type LucideIcon } from 'lucide-react';
import type { ReviewState, SolveStatus, Verdict } from '@/lib/api';

export const VERDICT_LABEL: Record<Verdict, string> = {
  PENDING: '대기 중',
  JUDGING: '채점 중',
  AC: '정답',
  WA: '오답',
  TLE: '시간 초과',
  MLE: '메모리 초과',
  RE: '런타임 에러',
  CE: '컴파일 에러',
  IE: '채점 오류',
};

const VERDICT_STYLE: Record<Verdict, { cls: string; Icon: LucideIcon; spin?: boolean }> = {
  PENDING: { cls: 'bg-fill text-fg-2', Icon: Clock },
  JUDGING: { cls: 'bg-info-soft text-info', Icon: RefreshCw, spin: true },
  AC: { cls: 'bg-success-soft text-success', Icon: CheckCircle2 },
  WA: { cls: 'bg-error-soft text-error', Icon: XCircle },
  TLE: { cls: 'bg-warning-soft text-warning', Icon: Clock },
  MLE: { cls: 'bg-warning-soft text-warning', Icon: AlertCircle },
  RE: { cls: 'bg-error-soft text-error', Icon: AlertCircle },
  CE: { cls: 'bg-fill text-fg-2', Icon: AlertCircle },
  IE: { cls: 'bg-fill text-fg-2', Icon: AlertCircle },
};

/** 채점 결과 태그: 색 + 아이콘 */
export function VerdictBadge({ verdict, short = false }: { verdict: Verdict; short?: boolean }) {
  const { cls, Icon, spin } = VERDICT_STYLE[verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={12} className={spin ? 'animate-spin' : ''} />
      {short ? verdict : VERDICT_LABEL[verdict]}
    </span>
  );
}

/** 난이도 태그 Lv.1~5 */
export function LevelTag({ level }: { level: number }) {
  const lv = Math.min(5, Math.max(1, level));
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-xs font-bold"
      style={{ background: `var(--lv${lv}-bg)`, color: `var(--lv${lv}-fg)` }}
    >
      Lv.{lv}
    </span>
  );
}

export function StatusLabel({ status }: { status: SolveStatus }) {
  if (status === 'solved')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <CheckCircle2 size={13} /> 해결
      </span>
    );
  if (status === 'tried')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
        <AlertCircle size={13} /> 시도함
      </span>
    );
  return <span className="text-xs text-fg-3">미풀이</span>;
}

export function TagChip({ tag, label }: { tag: string; label: string }) {
  return (
    <span className="inline-block rounded-md bg-fill px-2 py-0.5 text-xs text-fg-2" title={tag}>
      {label}
    </span>
  );
}

export const REVIEW_STATE_LABEL: Record<ReviewState, string> = { TODO: '복습 필요', REVIEWING: '재도전 중', DONE: '해결' };
const REVIEW_STATE_STYLE: Record<ReviewState, { cls: string; Icon: LucideIcon }> = {
  TODO: { cls: 'bg-error-soft text-error', Icon: Flame },
  REVIEWING: { cls: 'bg-warning-soft text-warning', Icon: RefreshCw },
  DONE: { cls: 'bg-success-soft text-success', Icon: CheckCircle2 },
};

/** 오답노트 상태 태그 */
export function ReviewStateTag({ state }: { state: ReviewState }) {
  const { cls, Icon } = REVIEW_STATE_STYLE[state];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={12} /> {REVIEW_STATE_LABEL[state]}
    </span>
  );
}
