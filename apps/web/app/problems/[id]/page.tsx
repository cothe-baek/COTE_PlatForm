'use client';

import { ArrowLeft, Play, RotateCcw, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LevelTag, StatusLabel, TagChip, VERDICT_LABEL, VerdictBadge } from '@/components/badges';
import { CodeEditor, TEMPLATES } from '@/components/code-editor';
import { ProblemBody } from '@/components/problem-body';
import { Button, Card, Loading } from '@/components/ui';
import { api, isFinalVerdict, LANGUAGE_LABEL, tagLabel, type Language, type ProblemDetail, type SubmissionDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const LANGS: Language[] = ['PYTHON', 'JAVASCRIPT', 'CPP', 'JAVA'];
const FILE_NAME: Record<Language, string> = { PYTHON: 'main.py', JAVASCRIPT: 'main.js', CPP: 'main.cpp', JAVA: 'Main.java' };
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

  const poll = useCallback(
    (sid: string) => {
      api<SubmissionDetail>(`/submissions/${sid}`).then((s) => {
        setResult(s);
        if (!isFinalVerdict(s.status)) pollRef.current = setTimeout(() => poll(sid), 700);
        else {
          setBusy(null);
          if (s.kind === 'SUBMIT') api<ProblemDetail>(`/problems/${id}`).then(setProblem); // 풀이 상태 갱신
        }
      });
    },
    [id],
  );
  useEffect(
    () => () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    },
    [],
  );

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

  function reset() {
    if (!confirm('코드를 처음 상태로 되돌릴까요?')) return;
    setCode(TEMPLATES[language]);
    setResult(null);
  }

  if (error && !problem) return <p className="text-error">{error}</p>;
  if (!problem) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/problems" className="rounded-md p-1.5 text-fg-2 hover:bg-fill hover:text-fg" aria-label="문제 목록으로">
          <ArrowLeft size={18} />
        </Link>
        <LevelTag level={problem.difficulty} />
        <h1 className="text-xl font-bold">{problem.title}</h1>
        <StatusLabel status={problem.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[11fr_13fr]">
        {/* 문제 설명 패널 */}
        <Card className="space-y-3 self-start">
          <div className="flex flex-wrap items-center gap-1">
            {problem.tags.map((t) => (
              <TagChip key={t} tag={t} label={tagLabel(t)} />
            ))}
            <span className="ml-auto text-xs text-fg-3">
              시간 {problem.timeLimitMs / 1000}초 · 메모리 {problem.memoryLimitMb}MB
            </span>
          </div>
          <ProblemBody markdown={problem.body} />
          <h2 className="pt-2 text-sm font-bold">입출력 예</h2>
          {problem.samples.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="mb-1 text-fg-2">입력 {i + 1}</p>
                <pre className="code-block">{s.input}</pre>
              </div>
              <div>
                <p className="mb-1 text-fg-2">출력 {i + 1}</p>
                <pre className="code-block">{s.output}</pre>
              </div>
            </div>
          ))}
        </Card>

        {/* 에디터 패널 */}
        <Card padded={false} className="flex flex-col overflow-hidden self-start">
          <div className="flex items-center justify-between border-b border-border-soft px-4 py-2.5">
            <span className="font-mono text-sm font-semibold">{FILE_NAME[language]}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-fg outline-none focus:border-primary"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANGUAGE_LABEL[l]}
                </option>
              ))}
            </select>
          </div>
          <div className="h-[380px]">
            <CodeEditor language={language} value={code} onChange={setCode} />
          </div>
          <div className="space-y-2 border-t border-border-soft p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">실행 결과</span>
              {result && <VerdictBadge verdict={result.status} />}
              {result && isFinalVerdict(result.status) && (
                <span className="ml-auto text-xs text-fg-2">
                  {result.passedCount}/{result.totalCount} 통과 · {result.execTimeMs ?? 0}ms
                  {result.memoryKb ? ` · ${Math.round(result.memoryKb / 1024)}MB` : ''}
                </span>
              )}
            </div>
            {error ? (
              <p className="text-sm text-error">{error}</p>
            ) : result ? (
              <ResultPanel result={result} />
            ) : (
              <pre className="code-block min-h-24 text-fg-3">{user ? '실행 결과가 여기에 표시됩니다.' : '실행·제출하려면 로그인이 필요합니다.'}</pre>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border-soft p-3">
            <Button onClick={reset} disabled={!!busy}>
              <RotateCcw size={14} /> 초기화
            </Button>
            <Button onClick={() => send('run')} disabled={!!busy}>
              <Play size={14} /> {busy === 'run' ? '실행 중…' : '코드 실행'}
            </Button>
            <Button variant="primary" onClick={() => send('submit')} disabled={!!busy}>
              <Send size={14} /> {busy === 'submit' ? '채점 중…' : '제출 후 채점하기'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: SubmissionDetail }) {
  const final = isFinalVerdict(result.status);
  if (!final) return <pre className="code-block min-h-24 text-fg-3">{result.kind === 'RUN' ? '실행 중입니다...' : '채점 중입니다...'}</pre>;
  if (result.status === 'CE') return <pre className="code-block max-h-56 overflow-auto text-error">{result.compileLog}</pre>;

  if (result.kind === 'RUN') {
    return (
      <div className="space-y-2">
        {result.results.map((r) => (
          <div key={r.order} className="rounded-md border border-border-soft p-2.5">
            <div className="mb-1.5 flex items-center gap-2 text-xs text-fg-2">
              예제 {r.order} <VerdictBadge verdict={r.verdict} /> <span>{r.execTimeMs}ms</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="mb-1 text-fg-3">입력</p>
                <pre className="code-block">{r.input}</pre>
              </div>
              <div>
                <p className="mb-1 text-fg-3">기대 출력</p>
                <pre className="code-block">{r.expected}</pre>
              </div>
              <div>
                <p className="mb-1 text-fg-3">내 출력</p>
                <pre className={`code-block ${r.verdict === 'AC' ? 'bg-success-soft' : 'bg-error-soft'}`}>{r.stdout || (r.stderr ? '' : '(출력 없음)')}</pre>
                {r.stderr && <pre className="code-block mt-1 text-error">{r.stderr}</pre>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {result.results.map((r) => (
          <span
            key={r.order}
            title={`${VERDICT_LABEL[r.verdict]} · ${r.execTimeMs}ms`}
            className={`h-6 w-6 rounded-md text-center text-xs font-semibold leading-6 text-white ${r.verdict === 'AC' ? 'bg-success' : 'bg-error'}`}
          >
            {r.order}
          </span>
        ))}
        {Array.from({ length: result.totalCount - result.results.length }, (_, i) => (
          <span key={`skip-${i}`} className="h-6 w-6 rounded-md bg-fill text-center text-xs leading-6 text-fg-3">
            ·
          </span>
        ))}
      </div>
      {result.results.some((r) => r.stderr) && <pre className="code-block max-h-40 overflow-auto text-error">{result.results.find((r) => r.stderr)?.stderr}</pre>}
      {result.status === 'AC' ? (
        <p className="text-sm text-success">모든 테스트케이스를 통과했습니다.</p>
      ) : (
        <p className="text-sm text-fg-2">
          이 문제는{' '}
          <Link href="/review" className="font-medium text-primary hover:underline">
            오답노트
          </Link>
          에 등록됐습니다. 내일 복습 목록에 올라옵니다.
        </p>
      )}
    </div>
  );
}
