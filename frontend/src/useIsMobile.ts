import { useSyncExternalStore } from 'react'

// antd의 md 구간(768px)보다 좁으면 모바일 화면을 보여 준다.
const query = '(max-width: 767.98px)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
