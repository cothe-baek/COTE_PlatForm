import type { CSSProperties } from 'react'
import type { GlobalToken } from 'antd'

// 화면 아래쪽에 붙는 막대. 홈 인디케이터에 가리지 않도록 아래 여백을 더한다.
export function bottomBarStyle(token: GlobalToken, top: number, side: number): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    padding: `${top}px ${side}px calc(${top}px + env(safe-area-inset-bottom))`,
    background: token.colorBgContainer,
    borderTop: `1px solid ${token.colorBorderSecondary}`,
  }
}
