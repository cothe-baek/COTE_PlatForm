import { useState } from 'react'
import { Button, Card, Flex, Layout, Segmented, Space, Steps, Tag, Typography, theme } from 'antd'

const { Header, Content } = Layout

const steps = [
  { title: '문제 선택', content: '풀 문제를 고릅니다.' },
  { title: '코드 작성', content: '에디터에서 풀이를 작성합니다.' },
  { title: '제출', content: '코드를 제출합니다.' },
  { title: '채점 결과', content: '정답 여부를 확인합니다.' },
]

const sampleCode = `def solution(numbers, target):
    answer = 0
    return answer`

type AppProps = {
  isDark: boolean
  onChangeTheme: (dark: boolean) => void
}

function App({ isDark, onChangeTheme }: AppProps) {
  const [current, setCurrent] = useState(0)
  const { token } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0, color: token.colorPrimary }}>
          COTE
        </Typography.Title>
        <Segmented
          value={isDark ? 'dark' : 'light'}
          onChange={(value) => onChangeTheme(value === 'dark')}
          options={[
            { label: '라이트', value: 'light' },
            { label: '다크', value: 'dark' },
          ]}
        />
      </Header>
      <Content style={{ padding: token.paddingLG, maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <Flex vertical gap="large">
          <Card variant="borderless" style={{ boxShadow: token.boxShadowTertiary }} title="문제 풀이 단계">
            <Flex vertical gap="large">
              <Steps current={current} onChange={setCurrent} items={steps} />
              <Space>
                <Button onClick={() => setCurrent(current - 1)} disabled={current === 0}>
                  이전
                </Button>
                <Button
                  type="primary"
                  onClick={() => setCurrent(current + 1)}
                  disabled={current === steps.length - 1}
                >
                  다음
                </Button>
              </Space>
            </Flex>
          </Card>

          <Card variant="borderless" style={{ boxShadow: token.boxShadowTertiary }} title="코드 블록">
            <pre
              style={{
                margin: 0,
                padding: token.padding,
                borderRadius: token.borderRadius,
                background: token.colorFillAlter,
                fontFamily: token.fontFamilyCode,
                fontSize: token.fontSizeSM,
                overflowX: 'auto',
              }}
            >
              {sampleCode}
            </pre>
          </Card>

          <Card variant="borderless" style={{ boxShadow: token.boxShadowTertiary }} title="채점 결과 태그">
            <Space wrap>
              <Tag color="success">정답</Tag>
              <Tag color="error">오답</Tag>
              <Tag color="warning">시간 초과</Tag>
              <Tag color="processing">채점 중</Tag>
            </Space>
          </Card>
        </Flex>
      </Content>
    </Layout>
  )
}

export default App
