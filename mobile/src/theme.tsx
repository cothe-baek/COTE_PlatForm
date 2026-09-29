import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Platform, useColorScheme } from 'react-native'

// 웹(frontend/src/theme.ts)과 같은 브랜드 색. antd가 계산해 주던 파생 색은 값으로 적어 둔다.

type LevelColors = { bg: string; fg: string }

export type CoteTheme = {
  dark: boolean
  primary: string
  primaryActive: string
  primaryBorder: string
  success: string
  successBg: string
  successBorder: string
  warning: string
  layout: string
  container: string
  elevated: string
  fillAlter: string
  fillTertiary: string
  fillSecondary: string
  text: string
  textSecondary: string
  textTertiary: string
  textQuaternary: string
  textOnPrimary: string
  border: string
  borderSecondary: string
  cardShadow: string | undefined
  primaryShadow: string | undefined
  levels: Record<1 | 2 | 3 | 4 | 5, LevelColors>
}

export const lightTheme: CoteTheme = {
  dark: false,
  primary: '#4F5BF5',
  primaryActive: '#3A43CF',
  primaryBorder: '#C9CDFD',
  success: '#16A34A',
  successBg: '#ECF8F1',
  successBorder: '#ADDFC0',
  warning: '#D97706',
  layout: '#F6F7FB',
  container: '#FFFFFF',
  elevated: '#FFFFFF',
  fillAlter: 'rgba(0,0,0,0.02)',
  fillTertiary: 'rgba(0,0,0,0.04)',
  fillSecondary: 'rgba(0,0,0,0.06)',
  text: '#111827',
  textSecondary: 'rgba(0,0,0,0.65)',
  textTertiary: 'rgba(0,0,0,0.45)',
  textQuaternary: 'rgba(0,0,0,0.25)',
  textOnPrimary: '#FFFFFF',
  border: '#D9D9D9',
  borderSecondary: '#ECEEF5',
  cardShadow: '0 4px 24px rgba(79,91,245,0.06)',
  primaryShadow: '0 6px 16px rgba(79,91,245,0.28)',
  levels: {
    1: { bg: '#F6FFED', fg: '#389E0D' },
    2: { bg: '#E6F4FF', fg: '#0958D9' },
    3: { bg: '#FFFBE6', fg: '#D48806' },
    4: { bg: '#FFF2E8', fg: '#D4380D' },
    5: { bg: '#FFF0F6', fg: '#C41D7F' },
  },
}

// 문제 풀이 화면 같은 남색(네이비) 계열 다크 테마.
export const darkTheme: CoteTheme = {
  dark: true,
  primary: '#6D78F7',
  primaryActive: '#5560D8',
  primaryBorder: 'rgba(109,120,247,0.45)',
  success: '#16A34A',
  successBg: '#254047',
  successBorder: '#205D48',
  warning: '#D97706',
  layout: '#1F2D3D',
  container: '#263747',
  elevated: '#2E4153',
  fillAlter: '#1E2A3B',
  fillTertiary: 'rgba(255,255,255,0.08)',
  fillSecondary: 'rgba(255,255,255,0.12)',
  text: '#E6EDF3',
  textSecondary: '#B2C0CC',
  textTertiary: 'rgba(255,255,255,0.45)',
  textQuaternary: 'rgba(255,255,255,0.25)',
  textOnPrimary: '#FFFFFF',
  border: '#3A4D60',
  borderSecondary: '#172334',
  cardShadow: undefined,
  primaryShadow: undefined,
  levels: {
    1: { bg: 'rgba(115,209,61,0.15)', fg: '#73D13D' },
    2: { bg: 'rgba(64,150,255,0.15)', fg: '#4096FF' },
    3: { bg: 'rgba(255,197,61,0.15)', fg: '#FFC53D' },
    4: { bg: 'rgba(255,122,69,0.15)', fg: '#FF7A45' },
    5: { bg: 'rgba(247,89,171,0.15)', fg: '#F759AB' },
  },
}

// antd 기본 글자 크기와 줄 높이. React Native는 줄 높이를 px로 받는다.
export const font = {
  sm: { fontSize: 12, lineHeight: 20 },
  body: { fontSize: 14, lineHeight: 22 },
  lg: { fontSize: 16, lineHeight: 24 },
  h3: { fontSize: 24, lineHeight: 32 },
  h4: { fontSize: 20, lineHeight: 28 },
  h5: { fontSize: 16, lineHeight: 24 },
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
}

export const radius = { sm: 6, md: 10, lg: 16 }

type ThemeContextValue = { theme: CoteTheme; setDark: (dark: boolean) => void }

const ThemeContext = createContext<ThemeContextValue>({ theme: lightTheme, setDark: () => {} })

// 처음에는 기기 설정을 따르고, 목록 화면의 라이트/다크 전환으로 바꿀 수 있다.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme()
  const [dark, setDark] = useState<boolean | null>(null)
  const theme = (dark ?? scheme === 'dark') ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ theme, setDark }}>{children}</ThemeContext.Provider>
}

export function useCoteTheme() {
  return useContext(ThemeContext)
}
