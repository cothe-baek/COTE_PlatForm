'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DifficultyBadge, StatusDot, TagChip, VERDICT_LABEL, VerdictBadge } from '@/components/badges';
import { CodeEditor, TEMPLATES } from '@/components/code-editor';
import { ProblemBody } from '@/components/problem-body';
import { api, isFinalVerdict, LANGUAGE_LABEL, tagLabel, type Language, type ProblemDetail, type SubmissionDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const LANGS: Language[] = ['PYTHON', 'JAVASCRIPT', 'CPP', 'JAVA'];
const draftKey = (id: string, lang: Language) => `cote.draft.${id}.${lang}`;

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<Language>('PYTHON');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<SubmissionDetail | null>(null);
  const [busy, setBusy] = useState<'run' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api<ProblemDetail>(`/problems/${id}`).then(setProblem).catch((e) => setError(e.message));
  }, [id]);

  // 언어별 임시 저장 (브라우저 localStorage)
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(draftKey(id, language));
    } catch {
      /* ignore */
    }
    setCode(saved ?? TEMPLATES[language]);
  }, [id, language]);
  useEffect(() => {
    try {
      localStorage.setItem(draftKey(id, language), code);
    } catch {
      /* ignore */
    }
  }, [id, language, code]);

  const poll = useCallback((sid: string) => {
    api<SubmissionDetail>(`/submissions/${sid}`).then((s) => {
      setResult(s);
      if (!isFinalVerdict(s.status)) pollRef.current = setTimeout(() => poll(sid), 700);
      else {
        setBusy(null);
        if (s.kind === 'SUBMIT') api<ProblemDetail>(`/problems/${id}`).then(setProblem); // 풀이 상태 갱신
      }
    });
  }, [id]);
  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
  }, []);

  async function send(kind: 'run' | 'submit') {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setBusy(kind);
    setError(null);
    setResult(null);
    try {
      const s = await api<{ id: string }>(`/problems/${id}/${kind}`, { method: 'POST', json: { language, code } });
      poll(s.id);
    } catch (e) {
      setBusy(null);
      setError(e instanceof Error ? e.message : '요청 실패');
    }
  }

  if (error && !problem) return <p className="text-red-600">{error}</p>;
  if (!problem) return <p className="text-sm text-slate-500">불러오는 중…</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 문제 설명 */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{problem.title}</h1>
          <DifficultyBadge level={problem.difficulty} />
          <StatusDot status={problem.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {problem.tags.map((t) => (
            <TagChip key={t} tag={t} label={tagLabel(t)} />
          ))}
          <span className="ml-2 text-xs text-slate-400">
            시간 {problem.timeLimitMs / 1000}초 · 메모리 {problem.memoryLimitMb}MB
          </span>
        </div>
        <ProblemBody markdown={problem.body} />
        <h2 className="mt-6 mb-2 text-lg font-semibold">예제</h2>
        {problem.samples.map((s, i) => (
          <div key={i} className="mb-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="mb-1 text-slate-500">입력 {i + 1}</p>
              <pre className="whitespace-pre-wrap rounded bg-slate-100 p-2">{s.input}</pre>
            </div>
            <div>
              <p className="mb-1 text-slate-500">출력 {i + 1}</p>
              <pre className="whitespace-pre-wrap rounded bg-slate-100 p-2">{s.output}</pre>
            </div>
          </div>
        ))}
      </section>

      {/* 에디터 + 결과 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm">
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_LABEL[l]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={() => send('run')} disabled={!!busy} className="rounded border border-slate-300 bg-white px-4 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50">
              {busy === 'run' ? '실행 중…' : '예제 실행'}
            </button>
            <button onClick={() => send('submit')} disabled={!!busy} className="rounded bg-emerald-600 px-4 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy === 'submit' ? '채점 중…' : '제출'}
            </button>
          </div>
        </div>
        <div className="h-[420px] overflow-hidden rounded-lg border border-slate-200">
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && <ResultPanel result={result} />}
        {!user && <p className="text-xs text-slate-500">실행·제출하려면 로그인이 필요합니다.</p>}
      </section>
    </div>
  );
}

function ResultPanel({ result }: { result: SubmissionDetail }) {
  const final = isFinalVerdict(result.status);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{result.kind === 'RUN' ? '예제 실행' : '제출'}</span>
          <VerdictBadge verdict={result.status} />
        </div>
        {final && (
          <span className="text-xs text-slate-500">
            {result.passedCount}/{result.totalCount} 통과 · {result.execTimeMs ?? 0}ms
            {result.memoryKb ? ` · ${Math.round(result.memoryKb / 1024)}MB` : ''}
          </span>
        )}
      </div>
      {result.status === 'CE' && result.compileLog && <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-900 p-3 text-xs text-red-200">{result.compileLog}</pre>}
      {result.kind === 'RUN' && (
        <div className="mt-3 space-y-3">
          {result.results.map((r) => (
            <div key={r.order} className="rounded border border-slate-100 p-2">
              <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                예제 {r.order} <VerdictBadge verdict={r.verdict} short /> {r.execTimeMs}ms
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-400">입력</p>
                  <pre className="whitespace-pre-wrap rounded bg-slate-50 p-1.5">{r.input}</pre>
                </div>
                <div>
                  <p className="text-slate-400">기대 출력</p>
                  <pre className="whitespace-pre-wrap rounded bg-slate-50 p-1.5">{r.expected}</pre>
                </div>
                <div>
                  <p className="text-slate-400">내 출력</p>
                  <pre className={`whitespace-pre-wrap rounded p-1.5 ${r.verdict === 'AC' ? 'bg-emerald-50' : 'bg-red-50'}`}>{r.stdout || (r.stderr ? '' : '(출력 없음)')}</pre>
                  {r.stderr && <pre className="mt-1 whitespace-pre-wrap rounded bg-slate-900 p-1.5 text-red-200">{r.stderr}</pre>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {result.kind === 'SUBMIT' && final && (
        <div className="mt-3 flex flex-wrap gap-1">
          {result.results.map((r) => (
            <span key={r.order} title={`${VERDICT_LABEL[r.verdict]} · ${r.execTimeMs}ms`} className={`h-6 w-6 rounded text-center text-xs leading-6 ${r.verdict === 'AC' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {r.order}
            </span>
          ))}
          {Array.from({ length: result.totalCount - result.results.length }, (_, i) => (
            <span key={`skip-${i}`} className="h-6 w-6 rounded bg-slate-200 text-center text-xs leading-6 text-slate-500">
              ·
            </span>
          ))}
          {result.status !== 'AC' && (
            <Link href="/review" className="ml-2 self-center text-xs text-slate-500 underline">
              오답노트에 등록됨
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
