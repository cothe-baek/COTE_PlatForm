import type { ReactNode } from 'react'
import { Button, Typography, theme } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { LevelTag } from '../../components'
import type { ProblemLevel } from '../../components'

// 화면 전체를 채우는 모바일 화면 틀. 위아래는 기기의 안전 영역만큼 비워 둔다.
export function MobileScreen({ children }: { children: ReactNode }) {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top)',
        boxSizing: 'border-box',
        background: token.colorBgLayout,
        color: token.colorText,
      }}
    >
      {children}
    </div>
  )
}

type MobileTopBarProps = {
  title: string
  level?: ProblemLevel
  onBack: () => void
  extra?: ReactNode
}

export function MobileTopBar({ title, level, onBack, extra }: MobileTopBarProps) {
  const { token } = theme.useToken()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXS,
        height: 52,
        padding: '0 12px 0 8px',
        flexShrink: 0,
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} aria-label="뒤로" />
      {level && <LevelTag level={level} />}
      <Typography.Title level={5} ellipsis style={{ flex: 1, minWidth: 0, margin: 0 }}>
        {title}
      </Typography.Title>
      {extra}
    </div>
  )
}
