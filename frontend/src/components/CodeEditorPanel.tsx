import { useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { Button, Flex, Popconfirm, Select, Typography, theme } from 'antd'
import { PlayCircleOutlined, SendOutlined } from '@ant-design/icons'
import { AsyncButton } from './AsyncButton'
import { ResultTag } from './ResultTag'
import type { JudgeResult } from './ResultTag'
import { createEditorTheme } from './editorTheme'

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp'

const languageInfo: Record<CodeLanguage, { label: string; fileName: string; extension: () => ReturnType<typeof python> }> = {
  python: { label: 'Python3', fileName: 'solution.py', extension: python },
  javascript: { label: 'JavaScript', fileName: 'solution.js', extension: javascript },
  java: { label: 'Java', fileName: 'Solution.java', extension: java },
  cpp: { label: 'C++', fileName: 'solution.cpp', extension: cpp },
}

export type CodeEditorPanelProps = {
  // 언어별 시작 코드. 여기에 있는 언어만 선택할 수 있다.
  templates: Partial<Record<CodeLanguage, string>>
  defaultLanguage?: CodeLanguage
  // 실행 결과로 보여 줄 문자열을 돌려준다.
  onRun?: (code: string, language: CodeLanguage) => Promise<string>
  // 채점 결과와 함께 보여 줄 문자열을 돌려준다.
  onSubmit?: (code: string, language: CodeLanguage) => Promise<{ result: JudgeResult; message: string }>
  editorHeight?: number
}

// 언어 선택, 코드 에디터, 실행 결과, 실행/제출 버튼을 묶은 풀이 패널.
export function CodeEditorPanel({
  templates,
  defaultLanguage,
  onRun,
  onSubmit,
  editorHeight = 360,
}: CodeEditorPanelProps) {
  const { token } = theme.useToken()
  // 다크 알고리즘은 colorBgBase를 검정으로 둔다.
  const isDark = token.colorBgBase === '#000' || token.colorBgBase === '#000000'
  const editorTheme = useMemo(() => createEditorTheme(token, isDark), [token, isDark])

  const languages = Object.keys(templates) as CodeLanguage[]
  const [language, setLanguage] = useState<CodeLanguage>(defaultLanguage ?? languages[0])
  // 언어를 바꿔도 각 언어에서 쓰던 코드는 남겨 둔다.
  const [codes, setCodes] = useState<Partial<Record<CodeLanguage, string>>>(templates)
  const [output, setOutput] = useState<string | null>(null)
  const [result, setResult] = useState<JudgeResult | null>(null)

  const code = codes[language] ?? ''
  const info = languageInfo[language]
  const extensions = useMemo(() => [info.extension()], [info])
  const divider = `1px solid ${token.colorBorderSecondary}`

  const setCode = (value: string) => setCodes((prev) => ({ ...prev, [language]: value }))

  const run = async () => {
    if (!onRun) return
    setResult(null)
    setOutput('실행 중입니다...')
    setOutput(await onRun(code, language))
  }

  const submit = async () => {
    if (!onSubmit) return
    setResult('judging')
    setOutput('채점 중입니다...')
    const judged = await onSubmit(code, language)
    setResult(judged.result)
    setOutput(judged.message)
  }

  const reset = () => {
    setCode(templates[language] ?? '')
    setOutput(null)
    setResult(null)
  }

  return (
    <Flex
      vertical
      style={{
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
        overflow: 'hidden',
      }}
    >
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: `${token.paddingSM}px ${token.padding}px`, borderBottom: divider }}
      >
        <Typography.Text strong>{info.fileName}</Typography.Text>
        <Select
          size="small"
          value={language}
          onChange={setLanguage}
          options={languages.map((lang) => ({ value: lang, label: languageInfo[lang].label }))}
          style={{ width: 120 }}
        />
      </Flex>

      <CodeMirror
        value={code}
        onChange={setCode}
        height={`${editorHeight}px`}
        theme={editorTheme}
        extensions={extensions}
        basicSetup={{ tabSize: 4 }}
      />

      <Flex vertical gap="small" style={{ padding: token.padding, borderTop: divider }}>
        <Flex align="center" gap="small">
          <Typography.Text strong>실행 결과</Typography.Text>
          {result && <ResultTag result={result} />}
        </Flex>
        <pre
          style={{
            margin: 0,
            minHeight: 96,
            maxHeight: 200,
            overflow: 'auto',
            padding: token.paddingSM,
            borderRadius: token.borderRadius,
            background: token.colorFillAlter,
            fontFamily: token.fontFamilyCode,
            fontSize: token.fontSizeSM,
            color: output ? token.colorText : token.colorTextQuaternary,
            whiteSpace: 'pre-wrap',
          }}
        >
          {output ?? '실행 결과가 여기에 표시됩니다.'}
        </pre>
      </Flex>

      <Flex justify="flex-end" gap="small" wrap style={{ padding: token.paddingSM, borderTop: divider }}>
        <Popconfirm title="코드를 처음 상태로 되돌릴까요?" okText="초기화" cancelText="취소" onConfirm={reset}>
          <Button>초기화</Button>
        </Popconfirm>
        <AsyncButton icon={<PlayCircleOutlined />} onClick={run} disabled={!onRun}>
          코드 실행
        </AsyncButton>
        <AsyncButton type="primary" icon={<SendOutlined />} onClick={submit} disabled={!onSubmit}>
          제출 후 채점하기
        </AsyncButton>
      </Flex>
    </Flex>
  )
}
