import type { ReactNode } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { ProblemLevel } from '../data/problems'
import { useCoteTheme } from '../theme'
import { Button } from './Button'
import { LevelTag } from './Tag'
import { Title } from './Typography'

// 화면 전체를 채우는 틀. 위쪽은 상태 표시줄만큼 비워 둔다.
export function Screen({ children }: { children: ReactNode }) {
  const { theme } = useCoteTheme()
  const insets = useSafeAreaInsets()
  return <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.layout }}>{children}</View>
}

// 높이 52의 흰 막대. 목록 화면의 헤더와 문제 화면의 상단 막대가 함께 쓴다.
export function Bar({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useCoteTheme()
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          height: 52,
          backgroundColor: theme.container,
          borderBottomWidth: 1,
          borderColor: theme.borderSecondary,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

type TopBarProps = { title: string; level?: ProblemLevel; extra?: ReactNode }

export function TopBar({ title, level, extra }: TopBarProps) {
  return (
    <Bar style={{ gap: 8, paddingLeft: 8, paddingRight: 12 }}>
      <Button type="text" icon="arrow-left" onPress={() => router.back()} accessibilityLabel="뒤로" />
      {level && <LevelTag level={level} />}
      <Title level={5} numberOfLines={1} style={{ flex: 1 }}>
        {title}
      </Title>
      {extra}
    </Bar>
  )
}

// 화면 아래쪽에 붙는 막대. 홈 인디케이터에 가리지 않도록 아래 여백을 더한다.
export function BottomBar({ children, padding, gap }: { children: ReactNode; padding: [number, number]; gap: number }) {
  const { theme } = useCoteTheme()
  const insets = useSafeAreaInsets()
  const [vertical, horizontal] = padding

  return (
    <View
      style={{
        gap,
        paddingTop: vertical,
        paddingHorizontal: horizontal,
        paddingBottom: vertical + insets.bottom,
        backgroundColor: theme.container,
        borderTopWidth: 1,
        borderColor: theme.borderSecondary,
      }}
    >
      {children}
    </View>
  )
}
