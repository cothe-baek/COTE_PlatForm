import { Flex, Segmented, Typography, theme } from 'antd'
import { ProblemCard } from '../../components'
import type { ProblemDetail } from '../../data/problems'
import { MobileScreen } from './MobileScreen'

type MobileProblemListPageProps = {
  problems: ProblemDetail[]
  onSelect: (id: number) => void
  isDark: boolean
  onChangeTheme: (dark: boolean) => void
}

export function MobileProblemListPage({ problems, onSelect, isDark, onChangeTheme }: MobileProblemListPageProps) {
  const { token } = theme.useToken()

  return (
    <MobileScreen>
      <Flex
        align="center"
        justify="space-between"
        style={{
          height: 52,
          padding: '0 16px',
          flexShrink: 0,
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
      </Flex>

      <Flex
        vertical
        gap={16}
        style={{ flex: 1, overflow: 'auto', padding: '20px 16px calc(16px + env(safe-area-inset-bottom))' }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            문제
          </Typography.Title>
          <Typography.Text type="secondary">풀고 싶은 문제를 골라 보세요.</Typography.Text>
        </div>
        <Flex vertical gap={12}>
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} onClick={() => onSelect(problem.id)} />
          ))}
        </Flex>
      </Flex>
    </MobileScreen>
  )
}
