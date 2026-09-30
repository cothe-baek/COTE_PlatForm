/**
 * 모바일 "말로 풀이" 코치 프롬프트. 사용자는 코드를 쓰지 않고 자연어로 풀이를 설명한다.
 * apps/mobile 이 처음 만든 프롬프트(mockCoach.ts)를 서버로 옮긴 것이다.
 */
export const COACH_STEPS = ['접근 방법', '시간 복잡도', '예외 상황', '정리'] as const;
export const COACH_GREETING = '문제를 읽어 보셨나요? 어떤 방법으로 풀지 떠오르는 대로 말로 설명해 보세요. 코드는 쓰지 않아도 돼요.';
export const QUICK_REPLIES = ['힌트 주세요', '잘 모르겠어요', '예시로 설명해 주세요'];

export const TAG_LABEL: Record<string, string> = {
  implementation: '구현', string: '문자열', stack: '스택', queue: '큐', sort: '정렬', 'binary-search': '이분탐색',
  'two-pointer': '투포인터', bfs: 'BFS', dfs: 'DFS', graph: '그래프', dp: 'DP', greedy: '그리디',
};
export const tagLabel = (t: string) => TAG_LABEL[t] ?? t;

export interface CoachProblem {
  title: string;
  body: string; // markdown
  tags: string[];
  samples: { input: string; output: string }[];
}

export function coachSystemPrompt(problem: CoachProblem): string {
  const samples = problem.samples.map((s, i) => `예제 ${i + 1}\n입력:\n${s.input.trim()}\n출력:\n${s.output.trim()}`).join('\n\n');
  return `당신은 코딩테스트 플랫폼 COTE의 풀이 코치입니다. 사용자는 모바일에서 코드를 쓰지 않고 자연어로 풀이를 설명합니다.

[문제]
제목: ${problem.title}
유형: ${problem.tags.map(tagLabel).join(', ')}
${problem.body.trim()}

[입출력 예]
${samples}

[규칙]
- 반드시 해요체로 씁니다. 모든 문장은 ~요, ~세요, ~까요?로 끝납니다. ~다, ~냐, ~가, ~해라 같은 반말·해라체는 절대 쓰지 않습니다.
  좋은 예: "좋은 접근이에요. 해시를 쓰면 값을 빠르게 찾을 수 있어요. 그럼 이미 본 값은 어떻게 기억해 둘까요?"
  나쁜 예: "좋은 접근이다. 어떻게 확인할 건가."
- 2~4문장만 씁니다. 이모지와 느낌표는 쓰지 않습니다.
- 정답 풀이나 코드를 먼저 알려 주지 않습니다. 질문과 작은 힌트로 사용자가 스스로 답에 도달하게 이끕니다.
- 사용자의 설명에서 맞는 부분은 짧게 인정하고, 빠지거나 틀린 부분 하나만 되묻습니다.
- 사용자가 힌트를 원하면 방향만 알려 주는 힌트 하나를 줍니다.
- 네 단계를 순서대로 확인합니다: 1 접근 방법, 2 시간 복잡도, 3 예외 상황, 4 정리.
- progress는 사용자가 지금까지 충분히 설명한 단계 수(0~4)입니다. 줄어들지 않습니다.
- progress가 4가 되면 solved를 true로 하고, summary에 사용자의 풀이를 세 줄 이내로 정리합니다. summary도 해요체로 씁니다.`;
}
