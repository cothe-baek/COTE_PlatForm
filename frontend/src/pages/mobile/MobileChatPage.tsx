import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, Drawer, Flex, Input, Typography, theme } from 'antd'
import { LoadingOutlined, SendOutlined } from '@ant-design/icons'
import { ProblemDescription, ResultTag } from '../../components'
import type { ProblemDetail } from '../../data/problems'
import { COACH_GREETING, COACH_STEPS, QUICK_REPLIES, mockAskCoach } from '../../data/mockCoach'
import type { ChatMessage } from '../../data/mockCoach'
import { bottomBarStyle } from './bottomBarStyle'
import { MobileScreen, MobileTopBar } from './MobileScreen'

// 접근 방법 → 시간 복잡도 → 예외 상황 → 정리 중 어디까지 설명했는지 보여 준다.
function StepBar({ progress }: { progress: number }) {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COACH_STEPS.length}, minmax(0, 1fr))`,
        gap: 6,
        padding: '10px 16px 12px',
        flexShrink: 0,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {COACH_STEPS.map((step, i) => {
        const done = i < progress
        const current = i === progress
        return (
          <Flex key={step} vertical gap={6}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: done ? token.colorPrimary : current ? token.colorPrimaryBorder : token.colorFillSecondary,
                transition: `background ${token.motionDurationSlow}`,
              }}
            />
            <span
              style={{
                fontSize: token.fontSizeSM,
                lineHeight: token.lineHeightSM,
                color: done || current ? token.colorText : token.colorTextTertiary,
                fontWeight: current ? 600 : 400,
              }}
            >
              {step}
            </span>
          </Flex>
        )
      })}
    </div>
  )
}

function Bubble({ role, children }: { role: ChatMessage['role']; children: ReactNode }) {
  const { token } = theme.useToken()
  const mine = role === 'user'

  return (
    <Flex vertical align={mine ? 'flex-end' : 'flex-start'} gap={4}>
      {!mine && (
        <span style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary, fontWeight: 600, paddingLeft: 4 }}>
          COTE 코치
        </span>
      )}
      <div
        style={{
          maxWidth: '84%',
          padding: '10px 14px',
          boxSizing: 'border-box',
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          whiteSpace: 'pre-wrap',
          wordBreak: 'keep-all',
          borderRadius: mine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: mine ? token.colorPrimary : token.colorBgContainer,
          color: mine ? token.colorTextLightSolid : token.colorText,
          boxShadow: mine ? 'none' : token.boxShadowTertiary,
        }}
      >
        {children}
      </div>
    </Flex>
  )
}

function SummaryCard({ summary, onNext }: { summary: string; onNext: () => void }) {
  const { token } = theme.useToken()

  return (
    <Flex
      vertical
      gap={10}
      style={{
        padding: 16,
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorSuccessBorder}`,
      }}
    >
      <Flex align="center" gap="small">
        <ResultTag result="accepted" />
        <Typography.Text strong>풀이 요약</Typography.Text>
      </Flex>
      <div
        style={{
          padding: 12,
          borderRadius: token.borderRadius,
          background: token.colorFillAlter,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          whiteSpace: 'pre-wrap',
          wordBreak: 'keep-all',
        }}
      >
        {summary}
      </div>
      <Button type="primary" block onClick={onNext}>
        다른 문제 풀기
      </Button>
    </Flex>
  )
}

type MobileChatPageProps = {
  problem: ProblemDetail
  onBack: () => void
  onSolved: () => void
  onNext: () => void
}

// 코드 대신 말로 풀이를 설명하고, 코치가 질문과 힌트로 정답까지 이끈다.
export function MobileChatPage({ problem, onBack, onSolved, onNext }: MobileChatPageProps) {
  const { token } = theme.useToken()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy, summary])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy || summary) return

    const history: ChatMessage[] = [...messages, { role: 'user', text: trimmed }]
    setMessages(history)
    setDraft('')
    setBusy(true)
    try {
      const answer = await mockAskCoach(problem, history, progress)
      setMessages((prev) => [...prev, { role: 'assistant', text: answer.reply }])
      setProgress(answer.progress)
      if (answer.solved) {
        setProgress(COACH_STEPS.length)
        setSummary(answer.summary || '풀이를 모두 설명했어요.')
        onSolved()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <MobileScreen>
      <MobileTopBar
        title={problem.title}
        level={problem.level}
        onBack={onBack}
        extra={
          <Button size="small" onClick={() => setSheetOpen(true)}>
            문제 보기
          </Button>
        }
      />
      <StepBar progress={progress} />

      <Flex ref={scrollRef} vertical gap={14} style={{ flex: 1, overflow: 'auto', padding: '16px 16px 20px' }}>
        <Bubble role="assistant">{COACH_GREETING}</Bubble>
        {messages.map((message, i) => (
          <Bubble key={i} role={message.role}>
            {message.text}
          </Bubble>
        ))}
        {busy && (
          <Flex
            align="center"
            gap={6}
            style={{ paddingLeft: 4, fontSize: token.fontSizeSM, color: token.colorTextTertiary }}
          >
            <LoadingOutlined /> 답변을 쓰는 중입니다...
          </Flex>
        )}
        {summary && <SummaryCard summary={summary} onNext={onNext} />}
      </Flex>

      {!summary && (
        <div style={{ ...bottomBarStyle(token, 10, 12), gap: 10 }}>
          <Flex gap={6} style={{ overflowX: 'auto' }}>
            {QUICK_REPLIES.map((reply) => (
              <Button
                key={reply}
                size="small"
                disabled={busy}
                onClick={() => send(reply)}
                style={{ flexShrink: 0, borderRadius: 999, fontWeight: 400 }}
              >
                {reply}
              </Button>
            ))}
          </Flex>
          <Flex align="flex-end" gap="small">
            <Input.TextArea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send(draft)
                }
              }}
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder="풀이 방법을 말로 설명해 보세요"
              style={{ flex: 1, minHeight: 40, padding: '8px 12px', borderRadius: token.borderRadiusLG }}
            />
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              disabled={busy || !draft.trim()}
              onClick={() => send(draft)}
              aria-label="보내기"
            />
          </Flex>
        </div>
      )}

      <Drawer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        placement="bottom"
        closable={false}
        title={problem.title}
        extra={
          <Button type="text" onClick={() => setSheetOpen(false)}>
            닫기
          </Button>
        }
        styles={{
          wrapper: { height: 'auto', maxHeight: '78%' },
          section: { borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0` },
          header: { padding: '12px 12px 8px 20px', borderBottom: 'none' },
          body: { padding: '0 20px calc(16px + env(safe-area-inset-bottom))' },
        }}
      >
        <Flex vertical gap="small">
          <ProblemDescription problem={problem} />
        </Flex>
      </Drawer>
    </MobileScreen>
  )
}
