import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// 브랜드 디자인 토큰. 색이나 간격을 바꿀 때는 이 파일만 수정하면 된다.
const brandToken: ThemeConfig['token'] = {
  colorPrimary: '#4F5BF5', // 브랜드 파란색 (보라빛이 도는 인디고 계열)
  colorSuccess: '#16A34A', // 정답
  colorError: '#DC2626', // 오답
  colorInfo: '#4F5BF5', // 채점 중 등 안내 상태도 브랜드 색으로
  colorWarning: '#D97706', // 시간 초과
  borderRadius: 10,
  borderRadiusLG: 16,
  fontFamily:
    "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif",
  fontFamilyCode: "'JetBrains Mono', 'D2Coding', Consolas, monospace",
};

const components: ThemeConfig['components'] = {
  Button: {
    primaryShadow: '0 6px 16px rgba(79, 91, 245, 0.28)',
    fontWeight: 600,
  },
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...brandToken,
    colorBgLayout: '#F6F7FB', // 아주 옅은 회청색 배경
    colorText: '#111827',
    colorBorderSecondary: '#ECEEF5',
    boxShadowTertiary: '0 4px 24px rgba(79, 91, 245, 0.06)', // 카드 그림자
  },
  components,
};

// 문제 풀이 화면 같은 남색(네이비) 계열 다크 테마.
export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...brandToken,
    colorPrimary: '#6D78F7', // 어두운 배경에서 잘 보이도록 조금 밝게
    colorInfo: '#6D78F7',
    colorBgLayout: '#1F2D3D', // 페이지 배경
    colorBgContainer: '#263747', // 카드, 헤더, 패널
    colorBgElevated: '#2E4153', // 드롭다운, 모달
    colorFillAlter: '#1E2A3B', // 코드 블록, 표 머리글 같은 한 단계 어두운 면
    colorBorder: '#3A4D60',
    colorBorderSecondary: '#172334', // 패널 구분선
    colorText: '#E6EDF3',
    colorTextSecondary: '#B2C0CC',
    boxShadowTertiary: 'none',
  },
  components: {
    ...components,
    Button: {
      ...components?.Button,
      primaryShadow: 'none',
    },
  },
};
