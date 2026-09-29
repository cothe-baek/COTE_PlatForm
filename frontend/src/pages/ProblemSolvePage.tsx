import { useMemo } from 'react'
import { Button, Col, Flex, Row, Typography, theme } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { CodeEditorPanel, LevelTag, ProblemDescription } from '../components'
import { makeTemplates } from '../data/problems'
import type { ProblemDetail } from '../data/problems'
import { mockRun, mockSubmit } from '../data/mockJudge'

type ProblemSolvePageProps = {
  problem: ProblemDetail
  onBack: () => void
}

export function ProblemSolvePage({ problem, onBack }: ProblemSolvePageProps) {
  const { token } = theme.useToken()
  const templates = useMemo(() => makeTemplates(problem), [problem])

  return (
    <Flex vertical gap="middle">
      <Flex align="center" gap="small">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} aria-label="문제 목록으로" />
        <LevelTag level={problem.level} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {problem.title}
        </Typography.Title>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={11}>
          <Flex
            vertical
            gap="small"
            style={{
              padding: token.paddingLG,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              boxShadow: token.boxShadowTertiary,
            }}
          >
            <ProblemDescription problem={problem} />
          </Flex>
        </Col>

        <Col xs={24} lg={13}>
          <CodeEditorPanel
            key={problem.id}
            templates={templates}
            onRun={(code, language) => mockRun(problem, code, language)}
            onSubmit={(code, language) => mockSubmit(problem, code, language)}
          />
        </Col>
      </Row>
    </Flex>
  )
}
