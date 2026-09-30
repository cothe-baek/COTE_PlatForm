import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, getToken, setToken } from '../api'
import { listCoachSessions } from './coach'
import type { ProblemDetail, ProblemSummary } from './problems'

type User = { id: string; nickname: string }

type AppContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, nickname: string, password: string) => Promise<void>
  logout: () => Promise<void>
  problems: ProblemSummary[] | null
  problemsError: string | null
  reloadProblems: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [problems, setProblems] = useState<ProblemSummary[] | null>(null)
  const [problemsError, setProblemsError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      if (await getToken()) {
        try {
          setUser(await api<User>('/auth/me'))
        } catch {
          await setToken(null)
        }
      }
      setLoading(false)
    })()
  }, [])

  const reloadProblems = useCallback(async () => {
    setProblemsError(null)
    try {
      const [list, sessions] = await Promise.all([
        api<{ items: ProblemSummary[] }>('/problems?pageSize=100'),
        listCoachSessions(),
      ])
      const status = new Map(sessions.map((s) => [s.problemId, s.status]))
      setProblems(list.items.map((p) => ({ ...p, coachStatus: status.get(p.id) })))
    } catch (e) {
      setProblemsError(e instanceof Error ? e.message : '문제를 불러오지 못했습니다')
    }
  }, [])

  useEffect(() => {
    if (user) reloadProblems()
    else setProblems(null)
  }, [user, reloadProblems])

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ accessToken: string; user: User }>('/auth/login', { method: 'POST', json: { email, password } })
    await setToken(r.accessToken)
    setUser(r.user)
  }, [])

  const signup = useCallback(async (email: string, nickname: string, password: string) => {
    const r = await api<{ accessToken: string; user: User }>('/auth/signup', {
      method: 'POST',
      json: { email, nickname, password },
    })
    await setToken(r.accessToken)
    setUser(r.user)
  }, [])

  const logout = useCallback(async () => {
    await setToken(null)
    setUser(null)
  }, [])

  return (
    <AppContext.Provider value={{ user, loading, login, signup, logout, problems, problemsError, reloadProblems }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// 문제 상세를 API 에서 가져온다. 목록의 요약 정보와 별개로 본문·예제가 필요하다.
export function useProblem(id: string | undefined) {
  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    setProblem(null)
    api<ProblemDetail>(`/problems/${id}`)
      .then(setProblem)
      .catch((e) => setError(e instanceof Error ? e.message : '문제를 불러오지 못했습니다'))
  }, [id])
  return { problem, error }
}
