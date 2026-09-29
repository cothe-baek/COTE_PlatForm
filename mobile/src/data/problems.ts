// 서버가 붙기 전까지 쓰는 예제 문제 데이터. frontend/src/data/problems.ts와 같은 문제를 쓴다.

export type ProblemLevel = 1 | 2 | 3 | 4 | 5

export type ProblemDetail = {
  id: number
  title: string
  level: ProblemLevel
  tags: string[]
  solvedCount: number
  acceptanceRate: number // 0 ~ 100
  status?: 'solved' | 'tried'
  // 문자열은 문단, { code }는 코드 블록으로 보여 준다.
  description: (string | { code: string })[]
  constraints: string[]
  examples: Record<string, string>[]
}

export const problems: ProblemDetail[] = [
  {
    id: 1,
    title: '두 수의 합',
    level: 1,
    tags: ['해시'],
    solvedCount: 18342,
    acceptanceRate: 72,
    status: 'solved',
    description: [
      '정수 배열 nums와 정수 target이 주어집니다. 서로 다른 위치에 있는 두 수를 더해 target을 만들 수 있으면 두 수의 위치를 작은 것부터 담아 return 하도록 solution 함수를 완성해 주세요.',
      '답은 항상 하나만 존재합니다.',
    ],
    constraints: ['nums의 길이는 2 이상 10,000 이하입니다.', 'nums의 원소는 -10⁹ 이상 10⁹ 이하입니다.'],
    examples: [
      { nums: '[2, 7, 11, 15]', target: '9', result: '[0, 1]' },
      { nums: '[3, 2, 4]', target: '6', result: '[1, 2]' },
    ],
  },
  {
    id: 2,
    title: '부호 붙여 목표 만들기',
    level: 2,
    tags: ['DFS', 'BFS'],
    solvedCount: 9120,
    acceptanceRate: 58,
    status: 'tried',
    description: [
      '음이 아닌 정수들이 담긴 배열 numbers가 있습니다. 순서를 바꾸지 않고 각 수 앞에 + 또는 - 를 붙여 모두 더하면 여러 값을 만들 수 있습니다. 예를 들어 [2, 1, 1]로 2를 만드는 방법은 다음 두 가지입니다.',
      { code: '+2 +1 -1 = 2\n+2 -1 +1 = 2' },
      '배열 numbers와 목표 값 target이 주어질 때, target을 만드는 방법의 수를 return 하도록 solution 함수를 완성해 주세요.',
    ],
    constraints: [
      'numbers의 길이는 2 이상 20 이하입니다.',
      '각 수는 1 이상 50 이하의 자연수입니다.',
      'target은 1 이상 1,000 이하의 자연수입니다.',
    ],
    examples: [
      { numbers: '[2, 1, 1]', target: '2', result: '2' },
      { numbers: '[1, 1, 1, 1, 1]', target: '3', result: '5' },
    ],
  },
  {
    id: 3,
    title: '괄호 짝 맞추기',
    level: 2,
    tags: ['스택'],
    solvedCount: 12876,
    acceptanceRate: 64,
    description: [
      "문자열 s는 '(', ')', '[', ']', '{', '}' 로만 이루어져 있습니다. 모든 괄호가 올바른 순서로 열리고 닫히면 true, 아니면 false를 return 하도록 solution 함수를 완성해 주세요.",
    ],
    constraints: ['s의 길이는 1 이상 100,000 이하입니다.'],
    examples: [
      { s: '"([]{})"', result: 'true' },
      { s: '"([)]"', result: 'false' },
    ],
  },
  {
    id: 4,
    title: '섬의 개수',
    level: 3,
    tags: ['그래프', 'DFS'],
    solvedCount: 5430,
    acceptanceRate: 47,
    description: [
      'n × m 크기의 지도 grid가 주어집니다. 1은 땅, 0은 바다입니다. 상하좌우로 이어진 땅은 하나의 섬입니다. 지도에 있는 섬의 개수를 return 하도록 solution 함수를 완성해 주세요.',
    ],
    constraints: ['n과 m은 1 이상 300 이하입니다.', 'grid의 원소는 0 또는 1입니다.'],
    examples: [
      { grid: '[[1,1,0],[0,1,0],[0,0,1]]', result: '2' },
      { grid: '[[0,0],[0,0]]', result: '0' },
    ],
  },
  {
    id: 5,
    title: '가장 긴 증가하는 부분 수열',
    level: 3,
    tags: ['동적 계획법', '이분 탐색'],
    solvedCount: 3981,
    acceptanceRate: 39,
    description: [
      '정수 배열 nums에서 몇 개의 원소를 골라 원래 순서대로 나열했을 때 값이 계속 커지는 수열을 증가하는 부분 수열이라고 합니다. 가장 긴 증가하는 부분 수열의 길이를 return 하도록 solution 함수를 완성해 주세요.',
    ],
    constraints: ['nums의 길이는 1 이상 100,000 이하입니다.', 'nums의 원소는 -10⁹ 이상 10⁹ 이하입니다.'],
    examples: [
      { nums: '[10, 9, 2, 5, 3, 7, 101, 18]', result: '4' },
      { nums: '[7, 7, 7]', result: '1' },
    ],
  },
  {
    id: 6,
    title: '회의실 배정',
    level: 4,
    tags: ['그리디', '정렬'],
    solvedCount: 1874,
    acceptanceRate: 31,
    description: [
      '회의마다 시작 시각과 끝나는 시각이 [시작, 끝] 형태로 담긴 배열 meetings가 주어집니다. 회의실 하나에서 겹치지 않게 열 수 있는 회의의 최대 개수를 return 하도록 solution 함수를 완성해 주세요.',
      '한 회의가 끝나는 시각에 다음 회의를 바로 시작할 수 있습니다.',
    ],
    constraints: ['meetings의 길이는 1 이상 100,000 이하입니다.', '시각은 0 이상 10⁹ 이하의 정수입니다.'],
    examples: [{ meetings: '[[1,4],[3,5],[4,7],[6,8]]', result: '2' }],
  },
]
