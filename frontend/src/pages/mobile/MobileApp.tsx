import { useState } from 'react'
import { problems as initialProblems } from '../../data/problems'
import { MobileChatPage } from './MobileChatPage'
import { MobileProblemListPage } from './MobileProblemListPage'
import { MobileProblemPage } from './MobileProblemPage'

type MobileAppProps = {
  isDark: boolean
  onChangeTheme: (dark: boolean) => void
}

type Screen = { name: 'list' } | { name: 'problem' | 'chat'; id: number }

// 모바일에서는 코드를 쓰지 않는다. 문제 목록 → 문제 → 말로 풀이하기 순서로 이동한다.
export function MobileApp({ isDark, onChangeTheme }: MobileAppProps) {
  const [screen, setScreen] = useState<Screen>({ name: 'list' })
  const [problems, setProblems] = useState(initialProblems)
  const problem = screen.name === 'list' ? undefined : problems.find((item) => item.id === screen.id)

  if (!problem || screen.name === 'list') {
    return (
      <MobileProblemListPage
        problems={problems}
        onSelect={(id) => setScreen({ name: 'problem', id })}
        isDark={isDark}
        onChangeTheme={onChangeTheme}
      />
    )
  }

  if (screen.name === 'problem') {
    return (
      <MobileProblemPage
        problem={problem}
        onBack={() => setScreen({ name: 'list' })}
        onStart={() => setScreen({ name: 'chat', id: problem.id })}
      />
    )
  }

  const markSolved = () =>
    setProblems((prev) => prev.map((item) => (item.id === problem.id ? { ...item, status: 'solved' } : item)))

  return (
    <MobileChatPage
      key={problem.id}
      problem={problem}
      onBack={() => setScreen({ name: 'problem', id: problem.id })}
      onSolved={markSolved}
      onNext={() => setScreen({ name: 'list' })}
    />
  )
}
