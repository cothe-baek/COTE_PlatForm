import { ScrollView, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ProblemCard } from '../components/ProblemCard'
import { Bar, Screen } from '../components/Screen'
import { Segmented } from '../components/Segmented'
import { Text, Title } from '../components/Typography'
import { useProblems } from '../data/ProblemsContext'
import { useCoteTheme } from '../theme'

// 문제 목록. 웹과 같은 카드를 한 줄에 하나씩 보여 준다.
export default function ProblemListScreen() {
  const { theme, setDark } = useCoteTheme()
  const { problems } = useProblems()
  const insets = useSafeAreaInsets()

  return (
    <Screen>
      <Bar style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
        <Title level={4} style={{ color: theme.primary }}>
          COTE
        </Title>
        <Segmented
          value={theme.dark ? 'dark' : 'light'}
          onChange={(value) => setDark(value === 'dark')}
          options={[
            { label: '라이트', value: 'light' },
            { label: '다크', value: 'dark' },
          ]}
        />
      </Bar>

      <ScrollView contentContainerStyle={{ gap: 16, paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16 + insets.bottom }}>
        <View>
          <Title level={3}>문제</Title>
          <Text type="secondary">풀고 싶은 문제를 골라 보세요.</Text>
        </View>
        <View style={{ gap: 12 }}>
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onPress={() => router.push({ pathname: '/problems/[id]', params: { id: problem.id } })}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  )
}
