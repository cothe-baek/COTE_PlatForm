import { ScrollView, Text as RNText, View } from 'react-native'
import type { ProblemDetail } from '../data/problems'
import { font, radius, useCoteTheme } from '../theme'
import { Text, Title } from './Typography'

// 고정폭 글꼴과 한 단계 어두운 배경으로 코드를 보여 준다.
function CodeBlock({ code }: { code: string }) {
  const { theme } = useCoteTheme()
  return (
    <ScrollView
      horizontal
      style={{ borderRadius: radius.md, backgroundColor: theme.fillAlter }}
      contentContainerStyle={{ padding: 16 }}
    >
      <RNText style={[font.sm, { fontFamily: font.mono, color: theme.text }]}>{code}</RNText>
    </ScrollView>
  )
}

// antd의 small, bordered 표와 같은 입출력 예 표.
function ExamplesTable({ examples }: { examples: Record<string, string>[] }) {
  const { theme } = useCoteTheme()
  const columns = Object.keys(examples[0])
  const cell = { flex: 1, paddingVertical: 8, paddingHorizontal: 8, borderColor: theme.borderSecondary }
  const rows = [Object.fromEntries(columns.map((key) => [key, key])), ...examples]

  return (
    <View style={{ borderWidth: 1, borderColor: theme.borderSecondary, borderRadius: radius.lg, overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            borderTopWidth: i === 0 ? 0 : 1,
            borderColor: theme.borderSecondary,
            backgroundColor: i === 0 ? theme.fillAlter : theme.container,
          }}
        >
          {columns.map((key, j) => (
            <View key={key} style={[cell, { borderLeftWidth: j === 0 ? 0 : 1 }]}>
              <RNText
                style={[
                  font.body,
                  { color: theme.text, fontFamily: i === 0 ? undefined : font.mono, fontWeight: i === 0 ? '600' : '400' },
                ]}
              >
                {row[key]}
              </RNText>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

// 문제 설명, 제한사항, 입출력 예를 차례로 보여 준다. 문제 화면과 문제 보기 시트가 함께 쓴다.
export function ProblemDescription({ problem }: { problem: ProblemDetail }) {
  return (
    <View style={{ gap: 8 }}>
      <Title level={5}>문제 설명</Title>
      {problem.description.map((block, i) =>
        typeof block === 'string' ? <Text key={i}>{block}</Text> : <CodeBlock key={i} code={block.code} />,
      )}

      <Title level={5} style={{ marginTop: 12 }}>
        제한사항
      </Title>
      {problem.constraints.map((item) => (
        <View key={item} style={{ flexDirection: 'row', gap: 8, paddingLeft: 6 }}>
          <Text>•</Text>
          <Text style={{ flex: 1 }}>{item}</Text>
        </View>
      ))}

      <Title level={5} style={{ marginTop: 12 }}>
        입출력 예
      </Title>
      <ExamplesTable examples={problem.examples} />
    </View>
  )
}
