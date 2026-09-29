import { Col, Flex, Row, Typography } from 'antd'
import { ProblemCard } from '../components'
import { problems } from '../data/problems'

type ProblemListPageProps = {
  onSelect: (id: number) => void
}

export function ProblemListPage({ onSelect }: ProblemListPageProps) {
  return (
    <Flex vertical gap="large">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          문제
        </Typography.Title>
        <Typography.Text type="secondary">풀고 싶은 문제를 골라 보세요.</Typography.Text>
      </div>
      <Row gutter={[16, 16]}>
        {problems.map((problem) => (
          <Col key={problem.id} xs={24} sm={12} lg={8}>
            <ProblemCard problem={problem} onClick={() => onSelect(problem.id)} />
          </Col>
        ))}
      </Row>
    </Flex>
  )
}
