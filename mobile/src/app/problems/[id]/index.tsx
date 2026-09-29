import { ScrollView, View } from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { Button } from '../../../components/Button'
import { ProblemDescription } from '../../../components/ProblemDescription'
import { BottomBar, Screen, TopBar } from '../../../components/Screen'
import { Text } from '../../../components/Typography'
import { useProblem } from '../../../data/ProblemsContext'
import { radius, useCoteTheme } from '../../../theme'

// 문제를 읽고 말로 풀이를 시작하는 화면. 모바일에서는 코드를 쓰지 않는다.
export default function ProblemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const problem = useProblem(id)
  const { theme } = useCoteTheme()

  if (!problem) return <Redirect href="/" />

  return (
    <Screen>
      <TopBar title={problem.title} level={problem.level} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <View
          style={{ padding: 20, borderRadius: radius.lg, backgroundColor: theme.container, boxShadow: theme.cardShadow }}
        >
          <ProblemDescription problem={problem} />
        </View>
      </ScrollView>
      <BottomBar padding={[12, 16]} gap={8}>
        <Text small type="secondary" style={{ textAlign: 'center' }}>
          코드 대신 풀이 방법을 말로 설명하면 AI 코치가 정답까지 이끌어 줘요.
        </Text>
        <Button
          type="primary"
          size="large"
          block
          onPress={() => router.push({ pathname: '/problems/[id]/chat', params: { id: problem.id } })}
        >
          말로 풀이 시작하기
        </Button>
      </BottomBar>
    </Screen>
  )
}
