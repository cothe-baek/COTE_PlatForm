import { Button, Flex, Typography, theme } from 'antd'
import { ProblemDescription } from '../../components'
import type { ProblemDetail } from '../../data/problems'
import { bottomBarStyle } from './bottomBarStyle'
import { MobileScreen, MobileTopBar } from './MobileScreen'

type MobileProblemPageProps = {
  problem: ProblemDetail
  onBack: () => void
  onStart: () => void
}

export function MobileProblemPage({ problem, onBack, onStart }: MobileProblemPageProps) {
  const { token } = theme.useToken()

  return (
    <MobileScreen>
      <MobileTopBar title={problem.title} level={problem.level} onBack={onBack} />
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <Flex
          vertical
          gap="small"
          style={{
            padding: 20,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          <ProblemDescription problem={problem} />
        </Flex>
      </div>
      <div style={{ ...bottomBarStyle(token, 12, 16), gap: token.marginXS }}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, textAlign: 'center' }}>
          코드 대신 풀이 방법을 말로 설명하면 AI 코치가 정답까지 이끌어 줘요.
        </Typography.Text>
        <Button type="primary" size="large" block onClick={onStart}>
          말로 풀이 시작하기
        </Button>
      </div>
    </MobileScreen>
  )
}
