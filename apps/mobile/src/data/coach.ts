import { api } from '../api'

// 서버(apps/api/src/coach)와 같은 값. 화면 첫 렌더에 쓰고, /coach/meta 로 최신 값을 받아 덮어쓴다.
export const COACH_STEPS = ['접근 방법', '시간 복잡도', '예외 상황', '정리'] as const
export const QUICK_REPLIES = ['힌트 주세요', '잘 모르겠어요', '예시로 설명해 주세요']
export const COACH_GREETING =
  '문제를 읽어 보셨나요? 어떤 방법으로 풀지 떠오르는 대로 말로 설명해 보세요. 코드는 쓰지 않아도 돼요.'

export type ChatMessage = { role: 'user' | 'assistant'; text: string }

export type CoachSession = {
  id: string
  problemId: number
  messages: ChatMessage[]
  progress: number // 0 ~ 4
  solved: boolean
  summary: string | null
  updatedAt: string
}

export type CoachSessionSummary = { problemId: number; progress: number; solved: boolean; status: 'solved' | 'tried' }

export const getCoachSession = (problemId: number) => api<CoachSession | null>(`/coach/sessions/${problemId}`)
export const listCoachSessions = () => api<CoachSessionSummary[]>('/coach/sessions')
export const sendToCoach = (problemId: number, text: string) =>
  api<CoachSession>(`/coach/sessions/${problemId}/messages`, { method: 'POST', json: { text } })
export const resetCoachSession = (problemId: number) => api<void>(`/coach/sessions/${problemId}`, { method: 'DELETE' })
