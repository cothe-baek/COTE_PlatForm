import { useState } from 'react'
import { App as AntApp, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import App from './App.tsx'
import { darkTheme, lightTheme } from './theme.ts'

const STORAGE_KEY = 'cote-theme'

function loadIsDark() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark'
  } catch {
    return false
  }
}

function Root() {
  const [isDark, setIsDark] = useState(loadIsDark)

  const changeTheme = (dark: boolean) => {
    setIsDark(dark)
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      // 저장할 수 없는 환경이면 이번 방문 동안만 유지한다.
    }
  }

  return (
    <ConfigProvider locale={koKR} theme={isDark ? darkTheme : lightTheme}>
      <AntApp>
        <App isDark={isDark} onChangeTheme={changeTheme} />
      </AntApp>
    </ConfigProvider>
  )
}

export default Root
