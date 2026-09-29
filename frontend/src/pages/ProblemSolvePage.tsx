import { useMemo } from 'react'
import { Button, Col, Flex, Row, Table, Typography, theme } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { CodeBlock, CodeEditorPanel, LevelTag } from '../components'
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
  const exampleColumns = Object.keys(problem.examples[0]).map((key) => ({ title: key, dataIndex: key, key }))

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
            <Typography.Title level={5} style={{ margin: 0 }}>
              문제 설명
            </Typography.Title>
            {problem.description.map((block, i) =>
              typeof block === 'string' ? (
                <Typography.Paragraph key={i} style={{ margin: 0 }}>
                  {block}
                </Typography.Paragraph>
              ) : (
                <CodeBlock key={i} code={block.code} />
              ),
            )}

            <Typography.Title level={5} style={{ margin: `${token.marginSM}px 0 0` }}>
              제한사항
            </Typography.Title>
            <ul style={{ margin: 0, paddingInlineStart: 20 }}>
              {problem.constraints.map((item) => (
                <li key={item}>
                  <Typography.Text>{item}</Typography.Text>
                </li>
              ))}
            </ul>

            <Typography.Title level={5} style={{ margin: `${token.marginSM}px 0 0` }}>
              입출력 예
            </Typography.Title>
            <Table
              size="small"
              bordered
              pagination={false}
              columns={exampleColumns}
              dataSource={problem.examples.map((example, i) => ({ ...example, key: i }))}
              style={{ fontFamily: token.fontFamilyCode }}
            />
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
