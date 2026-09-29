import type { CodeLanguage, JudgeResult } from '../components'
import { makeTemplates } from './problems'
import type { ProblemDetail } from './problems'

// 채점 서버가 붙기 전까지 쓰는 가짜 실행/채점.

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockRun(problem: ProblemDetail, _code: string, language: CodeLanguage) {
  await wait(800)
  const lines = problem.examples.map((example, i) => {
    const input = Object.entries(example)
      .filter(([key]) => key !== 'result')
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    return `테스트 ${i + 1}\n  입력값 〉 ${input}\n  기댓값 〉 ${example.result}`
  })
  return `[${language}] 채점 서버가 아직 연결되지 않아 입력값과 기댓값만 보여 줍니다.\n\n${lines.join('\n\n')}`
}

export async function mockSubmit(
  problem: ProblemDetail,
  code: string,
  language: CodeLanguage,
): Promise<{ result: JudgeResult; message: string }> {
  await wait(1500)
  // 시작 코드를 그대로 내면 오답, 조금이라도 고쳤으면 정답으로 처리한다.
  if (code.trim() === makeTemplates(problem)[language].trim()) {
    return { result: 'wrong', message: '테스트 1 〉 실패\n테스트 2 〉 실패\n\n코드를 작성한 뒤 다시 제출해 보세요.' }
  }
  return { result: 'accepted', message: '테스트 1 〉 통과 (0.02ms)\n테스트 2 〉 통과 (0.03ms)\n\n(예시 채점 결과입니다)' }
}
