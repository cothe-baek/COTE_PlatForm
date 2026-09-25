import type { SolveStatus, Verdict } from '@/lib/api';

const VERDICT_STYLE: Record<Verdict, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  JUDGING: 'bg-blue-100 text-blue-700 animate-pulse',
  AC: 'bg-emerald-100 text-emerald-700',
  WA: 'bg-red-100 text-red-700',
  TLE: 'bg-amber-100 text-amber-700',
  MLE: 'bg-amber-100 text-amber-700',
  RE: 'bg-purple-100 text-purple-700',
  CE: 'bg-slate-200 text-slate-700',
  IE: 'bg-slate-200 text-slate-700',
};
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

export function VerdictBadge({ verdict, short = false }: { verdict: Verdict; short?: boolean }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${VERDICT_STYLE[verdict]}`}>
      {short ? verdict : `${VERDICT_LABEL[verdict]} (${verdict})`}
    </span>
  );
}

const DIFF_STYLE = ['', 'bg-emerald-50 text-emerald-700', 'bg-lime-50 text-lime-700', 'bg-amber-50 text-amber-700', 'bg-orange-50 text-orange-700', 'bg-red-50 text-red-700'];
export function DifficultyBadge({ level }: { level: number }) {
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${DIFF_STYLE[level] ?? ''}`}>Lv.{level}</span>;
}

export function StatusDot({ status }: { status: SolveStatus }) {
  const cls = status === 'solved' ? 'bg-emerald-500' : status === 'tried' ? 'bg-amber-400' : 'bg-slate-300';
  const label = status === 'solved' ? '해결' : status === 'tried' ? '시도' : '미풀이';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />
      {label}
    </span>
  );
}

export function TagChip({ tag, label }: { tag: string; label: string }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600" title={tag}>
      {label}
    </span>
  );
}
