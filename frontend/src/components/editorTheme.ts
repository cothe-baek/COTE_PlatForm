import { createTheme } from '@uiw/codemirror-themes'
import { tags as t } from '@lezer/highlight'
import type { GlobalToken } from 'antd'

// antd 토큰에서 CodeMirror 테마를 만든다. 테마를 바꾸면 에디터 색도 같이 바뀐다.
export function createEditorTheme(token: GlobalToken, isDark: boolean) {
  const syntax = isDark
    ? {
        keyword: '#8FA0FF',
        func: '#FFD479',
        variable: '#A6E3A1',
        string: '#F5B97F',
        number: '#FF8F8F',
        type: '#7FD1E0',
        comment: '#6B7F94',
        operator: '#C8D3DD',
      }
    : {
        keyword: '#4F5BF5',
        func: '#B45309',
        variable: '#15803D',
        string: '#0F766E',
        number: '#C2410C',
        type: '#0E7490',
        comment: '#8A94A6',
        operator: '#475569',
      }

  return createTheme({
    theme: isDark ? 'dark' : 'light',
    settings: {
      background: token.colorBgContainer,
      foreground: token.colorText,
      caret: token.colorPrimary,
      selection: isDark ? 'rgba(109, 120, 247, 0.35)' : 'rgba(79, 91, 245, 0.18)',
      selectionMatch: isDark ? 'rgba(109, 120, 247, 0.2)' : 'rgba(79, 91, 245, 0.1)',
      lineHighlight: token.colorFillAlter,
      gutterBackground: token.colorBgContainer,
      gutterForeground: token.colorTextQuaternary,
      gutterActiveForeground: token.colorTextSecondary,
      gutterBorder: 'transparent',
      fontFamily: token.fontFamilyCode,
      fontSize: '14px',
    },
    styles: [
      { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: syntax.keyword },
      { tag: [t.function(t.variableName), t.function(t.definition(t.variableName))], color: syntax.func },
      { tag: [t.variableName, t.propertyName], color: syntax.variable },
      { tag: [t.string, t.special(t.string)], color: syntax.string },
      { tag: [t.number, t.bool, t.null], color: syntax.number },
      { tag: [t.typeName, t.className], color: syntax.type },
      { tag: t.comment, color: syntax.comment, fontStyle: 'italic' },
      { tag: [t.operator, t.punctuation], color: syntax.operator },
    ],
  })
}
