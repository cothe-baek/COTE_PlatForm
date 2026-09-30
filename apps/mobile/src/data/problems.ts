// API(apps/api) 가 돌려주는 문제 데이터 모양

export type ProblemLevel = 1 | 2 | 3 | 4 | 5
export type CoachStatus = 'solved' | 'tried'

export type ProblemSummary = {
  id: number
  slug: string
  title: string
  difficulty: number
  tags: string[]
  submitCount: number
  acCount: number
  solvedUserCount: number
  // 모바일에서는 코치 세션 기준으로 표시한다 (말로 풀이를 마쳤으면 solved)
  coachStatus?: CoachStatus
}

export type ProblemDetail = {
  id: number
  slug: string
  title: string
  body: string // markdown
  difficulty: number
  timeLimitMs: number
  memoryLimitMb: number
  tags: string[]
  samples: { input: string; output: string }[]
}

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
}
export const tagLabel = (t: string) => TAG_LABEL[t] ?? t

export const toLevel = (difficulty: number): ProblemLevel => Math.min(5, Math.max(1, difficulty)) as ProblemLevel
