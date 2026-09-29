import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { problems as initialProblems } from './problems'
import type { ProblemDetail } from './problems'

type ProblemsContextValue = { problems: ProblemDetail[]; markSolved: (id: number) => void }

const ProblemsContext = createContext<ProblemsContextValue>({ problems: initialProblems, markSolved: () => {} })

// 말로 풀이를 끝낸 문제는 목록에서 해결로 보여 준다. 서버가 없으니 앱을 끄면 처음 상태로 돌아간다.
export function ProblemsProvider({ children }: { children: ReactNode }) {
  const [problems, setProblems] = useState(initialProblems)
  const markSolved = (id: number) =>
    setProblems((prev) => prev.map((problem) => (problem.id === id ? { ...problem, status: 'solved' } : problem)))

  return <ProblemsContext.Provider value={{ problems, markSolved }}>{children}</ProblemsContext.Provider>
}

export function useProblems() {
  return useContext(ProblemsContext)
}

export function useProblem(id: string | undefined) {
  return useProblems().problems.find((problem) => String(problem.id) === id)
}
