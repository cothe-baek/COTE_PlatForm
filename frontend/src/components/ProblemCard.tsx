import { Card, Flex, Tag, Typography, theme } from 'antd'
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons'

export type ProblemLevel = 1 | 2 | 3 | 4 | 5

export type ProblemSummary = {
  id: number
  title: string
  level: ProblemLevel
  tags: string[]
  solvedCount: number
  acceptanceRate: number // 0 ~ 100
  status?: 'solved' | 'tried'
}

const levelColors: Record<ProblemLevel, string> = {
  1: 'green',
  2: 'blue',
  3: 'gold',
  4: 'volcano',
  5: 'magenta',
}

export function LevelTag({ level }: { level: ProblemLevel }) {
  return (
    <Tag color={levelColors[level]} variant="filled" style={{ marginInlineEnd: 0, fontWeight: 600 }}>
      Lv. {level}
    </Tag>
  )
}

function StatusLabel({ status }: { status: NonNullable<ProblemSummary['status']> }) {
  const { token } = theme.useToken()
  const solved = status === 'solved'

  return (
    <Typography.Text
      style={{ fontSize: token.fontSizeSM, color: solved ? token.colorSuccess : token.colorWarning }}
    >
      {solved ? <CheckCircleFilled /> : <ExclamationCircleFilled />} {solved ? '해결' : '시도함'}
    </Typography.Text>
  )
}

type ProblemCardProps = {
  problem: ProblemSummary
  onClick?: () => void
}

// 문제 목록에서 한 문제를 보여 주는 카드.
export function ProblemCard({ problem, onClick }: ProblemCardProps) {
  const { token } = theme.useToken()

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      variant="borderless"
      style={{ height: '100%', boxShadow: token.boxShadowTertiary }}
      styles={{ body: { height: '100%' } }}
    >
      <Flex vertical gap="small" style={{ height: '100%' }}>
        <Flex justify="space-between" align="center">
          <LevelTag level={problem.level} />
          {problem.status && <StatusLabel status={problem.status} />}
        </Flex>

        <Typography.Title level={5} style={{ margin: 0 }}>
          {problem.title}
        </Typography.Title>

        <Flex wrap gap={4}>
          {problem.tags.map((tag) => (
            <Tag key={tag} variant="filled" style={{ marginInlineEnd: 0 }}>
              {tag}
            </Tag>
          ))}
        </Flex>

        <Typography.Text type="secondary" style={{ marginTop: 'auto', fontSize: token.fontSizeSM }}>
          완료한 사람 {problem.solvedCount.toLocaleString()}명 · 정답률 {problem.acceptanceRate}%
        </Typography.Text>
      </Flex>
    </Card>
  )
}
