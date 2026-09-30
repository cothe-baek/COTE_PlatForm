import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import type { ProblemLevel } from '../data/problems'
import { font, radius, useCoteTheme } from '../theme'

type TagProps = { background: string; color: string; borderColor?: string; strong?: boolean; children: ReactNode }

// antd Tag. 높이 22, 글자 12px, 모서리 6.
export function Tag({ background, color, borderColor, strong, children }: TagProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 7,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: borderColor ?? 'transparent',
        backgroundColor: background,
      }}
    >
      {typeof children === 'string' ? (
        <Text style={[font.sm, { color, fontWeight: strong ? '600' : '400' }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}

export function NeutralTag({ children }: { children: string }) {
  const { theme } = useCoteTheme()
  return (
    <Tag background={theme.fillTertiary} color={theme.text}>
      {children}
    </Tag>
  )
}

// 난이도는 항상 초록 → 파랑 → 금색 → 주황 → 자홍 순서다.
export function LevelTag({ level }: { level: ProblemLevel }) {
  const { theme } = useCoteTheme()
  const { bg, fg } = theme.levels[level]
  return (
    <Tag background={bg} color={fg} strong>
      {`Lv. ${level}`}
    </Tag>
  )
}

export function AcceptedTag() {
  const { theme } = useCoteTheme()
  return (
    <Tag background={theme.successBg} color={theme.success} borderColor={theme.successBorder}>
      <AntDesign name="check-circle" size={12} color={theme.success} />
      <Text style={[font.sm, { color: theme.success }]}>정답</Text>
    </Tag>
  )
}
