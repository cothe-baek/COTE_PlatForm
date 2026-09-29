import { Pressable, Text, View } from 'react-native'
import { font, radius, useCoteTheme } from '../theme'

type Option<T extends string> = { label: string; value: T }

type SegmentedProps<T extends string> = { value: T; options: Option<T>[]; onChange: (value: T) => void }

// antd Segmented. 헤더의 라이트/다크 전환에 쓴다.
export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  const { theme } = useCoteTheme()

  return (
    <View
      accessibilityRole="radiogroup"
      style={{
        flexDirection: 'row',
        padding: 2,
        borderRadius: radius.md,
        backgroundColor: theme.dark ? theme.fillAlter : theme.fillTertiary,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={{
              height: 28,
              paddingHorizontal: 11,
              justifyContent: 'center',
              borderRadius: radius.sm,
              backgroundColor: selected ? theme.elevated : 'transparent',
              boxShadow: selected
                ? '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
                : undefined,
            }}
          >
            <Text style={[font.body, { color: selected ? theme.text : theme.textSecondary }]}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}
