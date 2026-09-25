export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'cote.token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* 저장소를 못 쓰는 환경(사생활 모드 등)은 무시 */
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body = init.body;
  if (init.json !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, body });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
    } catch {
      /* JSON 이 아닌 에러 본문 */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---- 타입 ----
export type Language = 'PYTHON' | 'JAVASCRIPT' | 'CPP' | 'JAVA';
export type Verdict = 'PENDING' | 'JUDGING' | 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'IE';
export type SolveStatus = 'solved' | 'tried' | 'unsolved';
export type ReviewState = 'TODO' | 'REVIEWING' | 'DONE';

export interface User {
  id: string;
  nickname: string;
  email?: string;
}
export interface ProblemSummary {
  id: number;
  slug: string;
  title: string;
  difficulty: number;
  tags: string[];
  submitCount: number;
  acCount: number;
  status: SolveStatus;
}
export interface ProblemDetail {
  id: number;
  slug: string;
  title: string;
  body: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  samples: { input: string; output: string }[];
  status: SolveStatus;
}
export interface SubmissionResultRow {
  order: number;
  isSample: boolean;
  verdict: Verdict;
  execTimeMs: number | null;
  memoryKb: number | null;
  input?: string;
  expected?: string;
  stdout?: string | null;
  stderr?: string | null;
}
export interface SubmissionDetail {
  id: string;
  kind: 'RUN' | 'SUBMIT';
  language: Language;
  code: string;
  status: Verdict;
  execTimeMs: number | null;
  memoryKb: number | null;
  compileLog: string | null;
  passedCount: number;
  totalCount: number;
  createdAt: string;
  judgedAt: string | null;
  problem: { id: number; title: string; slug: string };
  results: SubmissionResultRow[];
}
export interface SubmissionRow {
  id: string;
  language: Language;
  status: Verdict;
  execTimeMs: number | null;
  memoryKb: number | null;
  passedCount: number;
  totalCount: number;
  createdAt: string;
  problem: { id: number; title: string; difficulty: number };
}
export interface ReviewNote {
  id: string;
  memo: string;
  state: ReviewState;
  failCount: number;
  reviewCount: number;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
  problem: { id: number; title: string; difficulty: number; tags: string[] };
  submissions?: { id: string; status: Verdict; language: Language; createdAt: string; passedCount: number; totalCount: number }[];
}
export interface Dashboard {
  totalProblems: number;
  solvedCount: number;
  triedCount: number;
  todaySolved: number;
  streak: number;
  reviewTodo: number;
  submissionCount: number;
  tagStats: { tag: string; total: number; tried: number; solved: number }[];
  recent: { id: string; status: Verdict; language: Language; createdAt: string; problem: { id: number; title: string } }[];
}
export interface Paged<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

export const LANGUAGE_LABEL: Record<Language, string> = {
  PYTHON: 'Python 3',
  JAVASCRIPT: 'JavaScript (Node)',
  CPP: 'C++17',
  JAVA: 'Java 21',
};

export const TAG_LABEL: Record<string, string> = {
  implementation: '구현',
  string: '문자열',
  stack: '스택',
  queue: '큐',
  sort: '정렬',
  'binary-search': '이분탐색',
  'two-pointer': '투포인터',
  bfs: 'BFS',
  dfs: 'DFS',
  graph: '그래프',
  dp: 'DP',
  greedy: '그리디',
};
export const tagLabel = (t: string) => TAG_LABEL[t] ?? t;

export const isFinalVerdict = (v: Verdict) => v !== 'PENDING' && v !== 'JUDGING';
