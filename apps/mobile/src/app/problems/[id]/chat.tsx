import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Button } from '../../../components/Button'
import { Bubble, ProblemSheet, StepBar, SummaryCard } from '../../../components/Chat'
import { BottomBar, Screen, TopBar } from '../../../components/Screen'
import { Text } from '../../../components/Typography'
import { useApp, useProblem } from '../../../data/AppContext'
import { COACH_GREETING, COACH_STEPS, QUICK_REPLIES, getCoachSession, resetCoachSession, sendToCoach } from '../../../data/coach'
import type { ChatMessage } from '../../../data/coach'
import { toLevel } from '../../../data/problems'
import { font, radius, useCoteTheme } from '../../../theme'

// 코드 대신 말로 풀이를 설명하고, 코치가 질문과 힌트로 정답까지 이끈다. 대화는 서버에 저장되어 이어서 할 수 있다.
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const problemId = Number(id)
  const { problem } = useProblem(id)
  const { reloadProblems } = useApp()
  const { theme } = useCoteTheme()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  // 이전 대화가 있으면 이어서 보여 준다
  useEffect(() => {
    if (!problemId) return
    getCoachSession(problemId)
      .then((s) => {
        if (s) {
          setMessages(s.messages)
          setProgress(s.progress)
          setSummary(s.solved ? (s.summary ?? '풀이를 모두 설명했어요.') : null)
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : '대화를 불러오지 못했습니다'))
      .finally(() => setLoaded(true))
  }, [problemId])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy || summary) return
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setDraft('')
    setBusy(true)
    setError(null)
    try {
      const s = await sendToCoach(problemId, trimmed)
      setMessages(s.messages)
      setProgress(s.progress)
      if (s.solved) {
        setProgress(COACH_STEPS.length)
        setSummary(s.summary || '풀이를 모두 설명했어요.')
        reloadProblems()
      }
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1))
      setDraft(trimmed)
      setError(e instanceof Error ? e.message : '답변을 받지 못했습니다')
    } finally {
      setBusy(false)
    }
  }

  const restart = () => {
    const doReset = async () => {
      await resetCoachSession(problemId)
      setMessages([])
      setProgress(0)
      setSummary(null)
      setError(null)
      reloadProblems()
    }
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('지금까지의 대화를 지우고 처음부터 설명할까요?')) doReset()
      return
    }
    Alert.alert('처음부터 다시', '지금까지의 대화를 지우고 처음부터 설명할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '다시 시작', style: 'destructive', onPress: doReset },
    ])
  }

  const title = problem?.title ?? '문제'

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar
          title={title}
          level={problem ? toLevel(problem.difficulty) : undefined}
          extra={
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {messages.length > 0 && (
                <Button size="small" type="text" onPress={restart} fontWeight="400" accessibilityLabel="처음부터 다시">
                  다시
                </Button>
              )}
              <Button size="small" onPress={() => setSheetOpen(true)} disabled={!problem}>
                문제 보기
              </Button>
            </View>
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
          {!loaded ? (
            <ActivityIndicator color={theme.textTertiary} />
          ) : (
            <>
              <Bubble role="assistant">{COACH_GREETING}</Bubble>
              {messages.map((message, i) => (
                <Bubble key={i} role={message.role}>
                  {message.text}
                </Bubble>
              ))}
            </>
          )}
          {busy && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
              <ActivityIndicator size="small" color={theme.textTertiary} />
              <Text small type="secondary">
                답변을 쓰는 중입니다...
              </Text>
            </View>
          )}
          {error && (
            <Text small style={{ color: '#DC2626', paddingLeft: 4 }}>
              {error}
            </Text>
          )}
          {summary && <SummaryCard summary={summary} onNext={() => router.dismissTo('/')} />}
        </ScrollView>

        {!summary && (
          <BottomBar padding={[10, 12]} gap={10}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {QUICK_REPLIES.map((reply) => (
                <Button key={reply} size="small" disabled={busy} onPress={() => send(reply)} fontWeight="400" style={{ borderRadius: 999 }}>
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

      {problem && <ProblemSheet problem={problem} open={sheetOpen} onClose={() => setSheetOpen(false)} />}
    </Screen>
  )
}
