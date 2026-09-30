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
      contentContainerStyle={{ padding: 12 }}
    >
      <RNText style={[font.sm, { fontFamily: font.mono, color: theme.text }]}>{code}</RNText>
    </ScrollView>
  )
}

type Block = { type: 'heading'; text: string } | { type: 'paragraph'; text: string } | { type: 'code'; text: string } | { type: 'list'; items: string[] }

// 문제 본문 마크다운을 화면에 그릴 수 있는 블록으로 나눈다. 제목(##), 문단, 코드 펜스, 목록만 다룬다.
export function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = []
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  let i = 0
  const inline = (s: string) => s.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1')
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++])
      i++
      blocks.push({ type: 'code', text: code.join('\n') })
    } else if (/^#{1,3}\s/.test(line)) {
      blocks.push({ type: 'heading', text: line.replace(/^#+\s*/, '') })
      i++
    } else if (/^[-*]\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s/.test(lines[i])) items.push(inline(lines[i++].replace(/^[-*]\s*/, '')))
      blocks.push({ type: 'list', items })
    } else if (line.trim() === '') {
      i++
    } else {
      const para: string[] = []
      while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,3}\s|```|[-*]\s)/.test(lines[i])) para.push(lines[i++])
      blocks.push({ type: 'paragraph', text: inline(para.join(' ')) })
    }
  }
  return blocks
}

function SamplesTable({ samples }: { samples: ProblemDetail['samples'] }) {
  const { theme } = useCoteTheme()
  const cell = { flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderColor: theme.borderSecondary }
  return (
    <View style={{ borderWidth: 1, borderColor: theme.borderSecondary, borderRadius: radius.lg, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', backgroundColor: theme.fillAlter }}>
        {['입력', '출력'].map((h, j) => (
          <View key={h} style={[cell, { borderLeftWidth: j === 0 ? 0 : 1 }]}>
            <RNText style={[font.body, { color: theme.text, fontWeight: '600' }]}>{h}</RNText>
          </View>
        ))}
      </View>
      {samples.map((s, i) => (
        <View key={i} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: theme.borderSecondary, backgroundColor: theme.container }}>
          {[s.input, s.output].map((v, j) => (
            <View key={j} style={[cell, { borderLeftWidth: j === 0 ? 0 : 1 }]}>
              <RNText style={[font.sm, { color: theme.text, fontFamily: font.mono }]}>{v.trimEnd()}</RNText>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

// 문제 본문과 입출력 예를 차례로 보여 준다. 문제 화면과 문제 보기 시트가 함께 쓴다.
export function ProblemDescription({ problem }: { problem: ProblemDetail }) {
  const blocks = parseMarkdown(problem.body)
  return (
    <View style={{ gap: 8 }}>
      {blocks.map((b, i) => {
        if (b.type === 'heading')
          return (
            <Title key={i} level={5} style={{ marginTop: i === 0 ? 0 : 12 }}>
              {b.text}
            </Title>
          )
        if (b.type === 'code') return <CodeBlock key={i} code={b.text} />
        if (b.type === 'list')
          return (
            <View key={i} style={{ gap: 4 }}>
              {b.items.map((item) => (
                <View key={item} style={{ flexDirection: 'row', gap: 8, paddingLeft: 6 }}>
                  <Text>•</Text>
                  <Text style={{ flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>
          )
        return <Text key={i}>{b.text}</Text>
      })}
      <Title level={5} style={{ marginTop: 12 }}>
        입출력 예
      </Title>
      <SamplesTable samples={problem.samples} />
      <Text small type="secondary">
        시간 {problem.timeLimitMs / 1000}초 · 메모리 {problem.memoryLimitMb}MB
      </Text>
    </View>
  )
}
