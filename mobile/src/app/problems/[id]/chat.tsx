import { useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { Button } from '../../../components/Button'
import { Bubble, ProblemSheet, StepBar, SummaryCard } from '../../../components/Chat'
import { BottomBar, Screen, TopBar } from '../../../components/Screen'
import { Text } from '../../../components/Typography'
import { useProblem, useProblems } from '../../../data/ProblemsContext'
import { COACH_GREETING, COACH_STEPS, QUICK_REPLIES, mockAskCoach } from '../../../data/mockCoach'
import type { ChatMessage } from '../../../data/mockCoach'
import { font, radius, useCoteTheme } from '../../../theme'

// 코드 대신 말로 풀이를 설명하고, 코치가 질문과 힌트로 정답까지 이끈다.
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const problem = useProblem(id)
  const { markSolved } = useProblems()
  const { theme } = useCoteTheme()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  if (!problem) return <Redirect href="/" />

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
        markSolved(problem.id)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar
          title={problem.title}
          level={problem.level}
          extra={
            <Button size="small" onPress={() => setSheetOpen(true)}>
              문제 보기
            </Button>
          }
        />
        <StepBar progress={progress} />

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 14, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 20 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <Bubble role="assistant">{COACH_GREETING}</Bubble>
          {messages.map((message, i) => (
            <Bubble key={i} role={message.role}>
              {message.text}
            </Bubble>
          ))}
          {busy && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
              <ActivityIndicator size="small" color={theme.textTertiary} />
              <Text small type="secondary">
                답변을 쓰는 중입니다...
              </Text>
            </View>
          )}
          {summary && <SummaryCard summary={summary} onNext={() => router.dismissTo('/')} />}
        </ScrollView>

        {!summary && (
          <BottomBar padding={[10, 12]} gap={10}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {QUICK_REPLIES.map((reply) => (
                <Button
                  key={reply}
                  size="small"
                  disabled={busy}
                  onPress={() => send(reply)}
                  fontWeight="400"
                  style={{ borderRadius: 999 }}
                >
                  {reply}
                </Button>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                multiline
                placeholder="풀이 방법을 말로 설명해 보세요"
                placeholderTextColor={theme.textQuaternary}
                style={[
                  font.body,
                  {
                    flex: 1,
                    minHeight: 40,
                    maxHeight: 4 * font.body.lineHeight + 18,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: radius.lg,
                    backgroundColor: theme.container,
                    color: theme.text,
                  },
                ]}
              />
              <Button
                type="primary"
                size="large"
                icon="send"
                disabled={busy || !draft.trim()}
                onPress={() => send(draft)}
                accessibilityLabel="보내기"
              />
            </View>
          </BottomBar>
        )}
      </KeyboardAvoidingView>

      <ProblemSheet problem={problem} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  )
}
