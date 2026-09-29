import { Tag } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons'

export type JudgeResult = 'accepted' | 'wrong' | 'timeout' | 'judging'

const resultStyles = {
  accepted: { color: 'success', label: '정답', icon: <CheckCircleOutlined /> },
  wrong: { color: 'error', label: '오답', icon: <CloseCircleOutlined /> },
  timeout: { color: 'warning', label: '시간 초과', icon: <ClockCircleOutlined /> },
  judging: { color: 'processing', label: '채점 중', icon: <SyncOutlined spin /> },
} as const

// 채점 결과를 색과 아이콘이 붙은 태그로 보여 준다.
export function ResultTag({ result }: { result: JudgeResult }) {
  const { color, label, icon } = resultStyles[result]
  return (
    <Tag color={color} icon={icon}>
      {label}
    </Tag>
  )
}
