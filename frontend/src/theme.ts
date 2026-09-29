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
  Steps: {
    iconSize: 28,
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

// antd 기본 다크 테마는 배경이 순수 검정이라, 푸른빛이 도는 짙은 회색으로 밝혀 쓴다.
export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...brandToken,
    colorPrimary: '#6D78F7', // 어두운 배경에서 잘 보이도록 조금 밝게
    colorInfo: '#6D78F7',
    colorBgLayout: '#1A1D27', // 페이지 배경
    colorBgContainer: '#232734', // 카드, 헤더
    colorBgElevated: '#2B3040', // 드롭다운, 모달
    colorBorder: '#3A4052',
    colorBorderSecondary: '#2F3444',
    colorText: '#E6E8EF',
    boxShadowTertiary: '0 4px 24px rgba(0, 0, 0, 0.25)',
  },
  components,
};
