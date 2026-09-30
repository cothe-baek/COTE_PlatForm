import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'
import { Redirect, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '../components/Button'
import { ProblemCard } from '../components/ProblemCard'
import { Bar, Screen } from '../components/Screen'
import { Segmented } from '../components/Segmented'
import { Text, Title } from '../components/Typography'
import { useApp } from '../data/AppContext'
import { useCoteTheme } from '../theme'

// 문제 목록. 모바일은 코드를 쓰지 않고 말로 풀이를 설명하는 흐름만 제공한다.
export default function ProblemListScreen() {
  const { theme, setDark } = useCoteTheme()
  const { user, loading, logout, problems, problemsError, reloadProblems } = useApp()
  const insets = useSafeAreaInsets()

  if (!loading && !user) return <Redirect href="/login" />

  return (
    <Screen>
      <Bar style={{ justifyContent: 'space-between', paddingHorizontal: 16, gap: 8 }}>
        <Title level={4} style={{ color: theme.primary }}>
          COTE
        </Title>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Segmented
            value={theme.dark ? 'dark' : 'light'}
            onChange={(value) => setDark(value === 'dark')}
            options={[
              { label: '라이트', value: 'light' },
              { label: '다크', value: 'dark' },
            ]}
          />
          <Button size="small" onPress={() => logout()} fontWeight="400">
            로그아웃
          </Button>
        </View>
      </Bar>

      <ScrollView
        contentContainerStyle={{ gap: 16, paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reloadProblems} tintColor={theme.textTertiary} />}
      >
        <View>
          <Title level={3}>말로 풀기</Title>
          <Text type="secondary">문제를 고르고 풀이 방법을 말로 설명해 보세요. 코치가 질문으로 이끌어 줘요.</Text>
        </View>
        {problemsError ? (
          <View style={{ gap: 8, alignItems: 'flex-start' }}>
            <Text style={{ color: '#DC2626' }}>{problemsError}</Text>
            <Button onPress={reloadProblems}>다시 시도</Button>
          </View>
        ) : !problems ? (
          <ActivityIndicator color={theme.textTertiary} style={{ marginTop: 24 }} />
        ) : (
          <View style={{ gap: 12 }}>
            {problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onPress={() => router.push({ pathname: '/problems/[id]', params: { id: problem.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  )
}
