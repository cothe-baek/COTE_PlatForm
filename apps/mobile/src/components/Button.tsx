import type { ComponentProps } from 'react'
import { Pressable, Text } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import { radius, useCoteTheme } from '../theme'

type ButtonProps = {
  type?: 'primary' | 'default' | 'text'
  size?: 'small' | 'middle' | 'large'
  block?: boolean
  disabled?: boolean
  icon?: ComponentProps<typeof AntDesign>['name']
  children?: string
  onPress?: () => void
  accessibilityLabel?: string
  style?: StyleProp<ViewStyle>
  fontWeight?: '400' | '600'
}

const sizes = {
  small: { height: 24, paddingHorizontal: 7, fontSize: 14, borderRadius: radius.sm },
  middle: { height: 32, paddingHorizontal: 15, fontSize: 14, borderRadius: radius.md },
  large: { height: 40, paddingHorizontal: 15, fontSize: 16, borderRadius: radius.lg },
}

// antd Button과 같은 모양. 누르면 한 단계 진한 색(antd palette 7)이 된다.
// 아이콘은 웹의 @ant-design/icons와 같은 AntDesign 글리프를 쓴다.
export function Button({
  type = 'default',
  size = 'middle',
  block,
  disabled,
  icon,
  children,
  onPress,
  accessibilityLabel,
  style,
  fontWeight = '600',
}: ButtonProps) {
  const { theme } = useCoteTheme()
  const { fontSize, ...box } = sizes[size]
  const iconOnly = !children

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => {
        const primaryBg = pressed ? theme.primaryActive : theme.primary
        return [
          box,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderWidth: type === 'text' ? 0 : 1,
            alignSelf: block ? 'stretch' : 'auto',
          },
          iconOnly && { width: box.height, paddingHorizontal: 0 },
          type === 'primary' && { backgroundColor: primaryBg, borderColor: primaryBg, boxShadow: theme.primaryShadow },
          type === 'default' && {
            backgroundColor: theme.container,
            borderColor: pressed ? theme.primaryActive : theme.border,
          },
          type === 'text' && { backgroundColor: pressed ? theme.fillTertiary : 'transparent' },
          disabled && {
            backgroundColor: type === 'text' ? 'transparent' : theme.fillTertiary,
            borderColor: theme.border,
            boxShadow: undefined,
          },
          style,
        ]
      }}
    >
      {({ pressed }) => {
        const color = disabled
          ? theme.textQuaternary
          : type === 'primary'
            ? theme.textOnPrimary
            : pressed && type === 'default'
              ? theme.primaryActive
              : theme.text
        return (
          <>
            {icon && <AntDesign name={icon} size={fontSize} color={color} />}
            {children && <Text style={{ fontSize, fontWeight, color }}>{children}</Text>}
          </>
        )
      }}
    </Pressable>
  )
}
