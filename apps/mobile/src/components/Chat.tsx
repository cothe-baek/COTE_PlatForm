import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Animated, Modal, Pressable, ScrollView, Text as RNText, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COACH_STEPS } from '../data/coach'
import type { ChatMessage } from '../data/coach'
import type { ProblemDetail } from '../data/problems'
import { font, radius, useCoteTheme } from '../theme'
import { Button } from './Button'
import { ProblemDescription } from './ProblemDescription'
import { AcceptedTag } from './Tag'
import { Text } from './Typography'

// 접근 방법 → 시간 복잡도 → 예외 상황 → 정리 중 어디까지 설명했는지 보여 준다.
export function StepBar({ progress }: { progress: number }) {
  const { theme } = useCoteTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6,
        paddingTop: 10,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.container,
        borderBottomWidth: 1,
        borderColor: theme.borderSecondary,
      }}
    >
      {COACH_STEPS.map((step, i) => {
        const done = i < progress
        const current = i === progress
        return (
          <View key={step} style={{ flex: 1, gap: 6 }}>
            <View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: done ? theme.primary : current ? theme.primaryBorder : theme.fillSecondary,
              }}
            />
            <RNText
              style={[
                font.sm,
                { color: done || current ? theme.text : theme.textTertiary, fontWeight: current ? '600' : '400' },
              ]}
            >
              {step}
            </RNText>
          </View>
        )
      })}
    </View>
  )
}

export function Bubble({ role, children }: { role: ChatMessage['role']; children: ReactNode }) {
  const { theme } = useCoteTheme()
  const mine = role === 'user'

  return (
    <View style={{ gap: 4, alignItems: mine ? 'flex-end' : 'flex-start' }}>
      {!mine && (
        <Text small strong style={{ paddingLeft: 4, color: theme.textSecondary }}>
          COTE 코치
        </Text>
      )}
      <View
        style={{
          maxWidth: '84%',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 16,
          borderTopLeftRadius: mine ? 16 : 4,
          borderTopRightRadius: mine ? 4 : 16,
          backgroundColor: mine ? theme.primary : theme.container,
          boxShadow: mine ? undefined : theme.cardShadow,
        }}
      >
        <RNText style={[font.body, { color: mine ? theme.textOnPrimary : theme.text }]}>{children}</RNText>
      </View>
    </View>
  )
}

export function SummaryCard({ summary, onNext }: { summary: string; onNext: () => void }) {
  const { theme } = useCoteTheme()

  return (
    <View
      style={{
        gap: 10,
        padding: 16,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: theme.successBorder,
        backgroundColor: theme.container,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AcceptedTag />
        <Text strong>풀이 요약</Text>
      </View>
      <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: theme.fillAlter }}>
        <Text>{summary}</Text>
      </View>
      <Button type="primary" block onPress={onNext}>
        다른 문제 풀기
      </Button>
    </View>
  )
}

type ProblemSheetProps = { problem: ProblemDetail; open: boolean; onClose: () => void }

// 채팅 중에 문제를 다시 볼 수 있도록 아래에서 올라오는 시트. 화면 높이의 78%까지 늘어난다.
export function ProblemSheet({ problem, open, onClose }: ProblemSheetProps) {
  const { theme } = useCoteTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const slide = useRef(new Animated.Value(height)).current

  useEffect(() => {
    if (open) {
      slide.setValue(height)
      Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true }).start()
    }
  }, [open, height, slide])

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        onPress={onClose}
        accessibilityLabel="닫기"
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        <Animated.View
          onStartShouldSetResponder={() => true}
          style={{
            maxHeight: '78%',
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            backgroundColor: theme.elevated,
            transform: [{ translateY: slide }],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12,
              paddingRight: 12,
              paddingBottom: 8,
              paddingLeft: 20,
            }}
          >
            <Text strong>{problem.title}</Text>
            <Button type="text" onPress={onClose}>
              닫기
            </Button>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 + insets.bottom }}>
            <ProblemDescription problem={problem} />
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
