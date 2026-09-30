import { Text as RNText } from 'react-native'
import type { TextProps as RNTextProps } from 'react-native'
import { font, useCoteTheme } from '../theme'

type TitleProps = RNTextProps & { level: 3 | 4 | 5 }

// antd Typography.Title과 같은 크기, 굵기 600.
export function Title({ level, style, ...rest }: TitleProps) {
  const { theme } = useCoteTheme()
  const size = level === 3 ? font.h3 : level === 4 ? font.h4 : font.h5
  return <RNText {...rest} style={[size, { fontWeight: '600', color: theme.text }, style]} />
}

// type="secondary"는 antd처럼 45% 글자색(colorTextDescription)을 쓴다.
type TextProps = RNTextProps & { type?: 'secondary'; strong?: boolean; small?: boolean }

export function Text({ type, strong, small, style, ...rest }: TextProps) {
  const { theme } = useCoteTheme()
  const color = type === 'secondary' ? theme.textTertiary : theme.text
  return (
    <RNText {...rest} style={[small ? font.sm : font.body, { color, fontWeight: strong ? '600' : '400' }, style]} />
  )
}
