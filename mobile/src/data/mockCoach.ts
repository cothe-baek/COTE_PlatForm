import type { ProblemDetail } from './problems'

// 모바일에서 말로 풀이를 설명하면 답해 주는 코치. AI 서버가 붙기 전까지 정해진 순서로 답한다.

export const COACH_STEPS = ['접근 방법', '시간 복잡도', '예외 상황', '정리'] as const

export const QUICK_REPLIES = ['힌트 주세요', '잘 모르겠어요', '예시로 설명해 주세요']

export const COACH_GREETING =
  '문제를 읽어 보셨나요? 어떤 방법으로 풀지 떠오르는 대로 말로 설명해 보세요. 코드는 쓰지 않아도 돼요.'

export type ChatMessage = { role: 'user' | 'assistant'; text: string }

export type CoachReply = {
  reply: string
  progress: number // 사용자가 충분히 설명한 단계 수 (0 ~ 4)
  solved: boolean
  summary: string | null
}

function problemText(problem: ProblemDetail) {
  const description = problem.description.map((block) => (typeof block === 'string' ? block : block.code)).join('\n')
  const examples = problem.examples
    .map((example) =>
      Object.entries(example)
        .map(([key, value]) => `${key}=${value}`)
        .join(', '),
    )
    .join('\n')
  return `제목: ${problem.title}\n${description}\n\n제한사항:\n${problem.constraints.join('\n')}\n\n입출력 예:\n${examples}`
}

// AI 서버가 붙으면 이 프롬프트로 Claude를 부르고, 응답 JSON을 CoachReply로 쓴다.
export function coachSystemPrompt(problem: ProblemDetail) {
  return `당신은 코딩테스트 플랫폼 COTE의 풀이 코치입니다. 사용자는 모바일에서 코드를 쓰지 않고 자연어로 풀이를 설명합니다.

[문제]
${problemText(problem)}

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
- progress가 4가 되면 solved를 true로 하고, summary에 사용자의 풀이를 세 줄 이내로 정리합니다. summary도 해요체로 씁니다.

반드시 JSON 객체 하나만 출력합니다. 예: {"reply": "방향이 맞아요. 그렇게 하면 nums가 가장 길 때 몇 번 비교하게 될까요?", "progress": 1, "solved": false, "summary": null}`
}

const scriptedReplies = [
  '그 방법으로 첫 번째 입출력 예를 직접 따라가 보면 어떤 순서로 값을 확인하게 되나요? 한 단계씩 말해 보세요.',
  '방향이 좋아요. 그렇게 하면 입력이 가장 클 때 대략 몇 번 연산하게 될까요? 시간 복잡도로 말해 보세요.',
  '시간 복잡도는 제한사항 안에 들어와요. 입력이 가장 작을 때나 값이 모두 같을 때처럼 예외가 되는 경우도 생각해 보세요.',
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// history의 마지막 메시지는 사용자가 방금 보낸 말이다.
export async function mockAskCoach(
  problem: ProblemDetail,
  history: ChatMessage[],
  progress: number,
): Promise<CoachReply> {
  await wait(900)
  const last = history[history.length - 1].text

  if (last === '힌트 주세요' || last === '잘 모르겠어요') {
    return {
      reply: `${problem.tags[0]} 분류의 문제예요. 이 방식을 쓰면 어떤 값을 빠르게 찾거나 기억해 둘 수 있을지 생각해 보세요.`,
      progress,
      solved: false,
      summary: null,
    }
  }

  const next = progress + 1
  if (next >= COACH_STEPS.length) {
    const explanations = history
      .filter((message) => message.role === 'user' && !QUICK_REPLIES.includes(message.text))
      .map((message) => message.text)
    return {
      reply: '네 단계를 모두 설명했어요. 지금까지 말한 풀이를 정리해 둘게요.',
      progress: COACH_STEPS.length,
      solved: true,
      summary: explanations.slice(-3).join('\n'),
    }
  }
  return { reply: scriptedReplies[next - 1], progress: next, solved: false, summary: null }
}
