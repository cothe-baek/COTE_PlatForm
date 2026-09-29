import { Pressable, View } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import type { ProblemDetail } from '../data/problems'
import { radius, useCoteTheme } from '../theme'
import { LevelTag, NeutralTag } from './Tag'
import { Text, Title } from './Typography'

// 18342 → 18,342. 기기의 Intl 지원 여부와 상관없이 같은 모양으로 보여 준다.
const withCommas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

function StatusLabel({ status }: { status: NonNullable<ProblemDetail['status']> }) {
  const { theme } = useCoteTheme()
  const solved = status === 'solved'
  const color = solved ? theme.success : theme.warning

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <AntDesign name={solved ? 'check-circle' : 'exclamation-circle'} size={12} color={color} />
      <Text small style={{ color }}>
        {solved ? '해결' : '시도함'}
      </Text>
    </View>
  )
}

// 문제 목록에서 한 문제를 보여 주는 카드. 웹의 ProblemCard와 같은 구성이다.
export function ProblemCard({ problem, onPress }: { problem: ProblemDetail; onPress: () => void }) {
  const { theme } = useCoteTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        gap: 8,
        padding: 24,
        borderRadius: radius.lg,
        backgroundColor: theme.container,
        boxShadow: theme.cardShadow,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <LevelTag level={problem.level} />
        {problem.status && <StatusLabel status={problem.status} />}
      </View>
      <Title level={5}>{problem.title}</Title>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {problem.tags.map((tag) => (
          <NeutralTag key={tag}>{tag}</NeutralTag>
        ))}
      </View>
      <Text type="secondary" small>
        완료한 사람 {withCommas(problem.solvedCount)}명 · 정답률 {problem.acceptanceRate}%
      </Text>
    </Pressable>
  )
}
