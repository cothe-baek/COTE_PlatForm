import { useState } from 'react'
import { Layout, Segmented, Typography, theme } from 'antd'
import { problems } from './data/problems'
import { ProblemListPage } from './pages/ProblemListPage'
import { ProblemSolvePage } from './pages/ProblemSolvePage'

const { Header, Content } = Layout

type AppProps = {
  isDark: boolean
  onChangeTheme: (dark: boolean) => void
}

function App({ isDark, onChangeTheme }: AppProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { token } = theme.useToken()
  const selected = problems.find((problem) => problem.id === selectedId)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${token.paddingLG}px`,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0, color: token.colorPrimary, cursor: 'pointer' }}
          onClick={() => setSelectedId(null)}
        >
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
      <Content style={{ padding: token.paddingLG, maxWidth: 1280, width: '100%', margin: '0 auto' }}>
        {selected ? (
          <ProblemSolvePage problem={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <ProblemListPage onSelect={setSelectedId} />
        )}
      </Content>
    </Layout>
  )
}

export default App
