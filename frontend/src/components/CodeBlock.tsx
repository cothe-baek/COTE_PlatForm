import { theme } from 'antd'

// 고정폭 글꼴과 한 단계 어두운 배경으로 코드를 보여 준다.
export function CodeBlock({ code }: { code: string }) {
  const { token } = theme.useToken()

  return (
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
      {code}
    </pre>
  )
}
