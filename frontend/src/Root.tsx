import { useEffect, useState } from 'react'
import { App as AntApp, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import App from './App.tsx'
import { darkTheme, lightTheme } from './theme.ts'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

// 시스템 다크 모드 설정에 맞춰 antd 테마를 바꾼다.
function Root() {
  const [isDark, setIsDark] = useState(darkQuery.matches)

  useEffect(() => {
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    darkQuery.addEventListener('change', onChange)
    return () => darkQuery.removeEventListener('change', onChange)
  }, [])

  return (
    <ConfigProvider locale={koKR} theme={isDark ? darkTheme : lightTheme}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  )
}

export default Root
