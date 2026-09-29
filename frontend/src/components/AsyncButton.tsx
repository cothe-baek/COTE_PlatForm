import { useState } from 'react'
import { Button } from 'antd'
import type { ButtonProps } from 'antd'

export type AsyncButtonProps = Omit<ButtonProps, 'onClick' | 'loading'> & {
  // Promise를 돌려주면 끝날 때까지 버튼이 로딩 상태가 된다.
  onClick?: () => Promise<unknown> | void
}

// 클릭하면 작업이 끝날 때까지 스스로 로딩을 표시하는 버튼.
export function AsyncButton({ onClick, ...rest }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!onClick) return
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return <Button {...rest} loading={loading} onClick={handleClick} />
}
