import { App as AntApp, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import App from './App.tsx'
import { appTheme } from './theme.ts'

function Root() {
  return (
    <ConfigProvider locale={koKR} theme={appTheme}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  )
}

export default Root
