import { Table, Typography, theme } from 'antd'
import type { ProblemDetail } from '../data/problems'
import { CodeBlock } from './CodeBlock'

// 문제 설명, 제한사항, 입출력 예를 차례로 보여 준다. 풀이 화면과 모바일 화면이 함께 쓴다.
export function ProblemDescription({ problem }: { problem: ProblemDetail }) {
  const { token } = theme.useToken()
  const exampleColumns = Object.keys(problem.examples[0]).map((key) => ({ title: key, dataIndex: key, key }))

  return (
    <>
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
    </>
  )
}
