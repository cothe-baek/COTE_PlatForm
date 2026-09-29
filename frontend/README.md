# COTE 프론트엔드

React + TypeScript + Vite + [Ant Design](https://ant.design/) 프로젝트입니다.

## 처음 실행하기

1. [Node.js](https://nodejs.org/) LTS 버전을 설치합니다. 터미널에서 `node -v`로 버전이 나오면 설치된 것입니다.
2. 이 폴더로 이동해서 패키지를 설치합니다. 처음 한 번만 하면 됩니다.
   ```bash
   cd frontend
   npm install
   ```
3. 개발 서버를 켭니다.
   ```bash
   npm run dev
   ```
4. 브라우저에서 http://localhost:5173 을 엽니다. 코드를 저장하면 화면이 바로 바뀝니다.

## 주요 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 검사 후 배포용 파일을 `dist/`에 생성 |
| `npm run lint` | 코드 검사 |

## 디자인 토큰

브랜드 색, 글꼴, 모서리 둥글기 같은 값은 `src/theme.ts`에 모여 있습니다. 이 파일만 고치면 모든 antd 컴포넌트에 반영됩니다.

- `token`: 전체 컴포넌트에 적용되는 값 (예: `colorPrimary`)
- `components`: 특정 컴포넌트에만 적용되는 값 (예: `Steps.iconSize`)

헤더의 라이트/다크 버튼으로 테마를 바꿀 수 있고, 선택한 테마는 브라우저에 저장됩니다. 다크 테마 값은 `theme.ts`의 `darkTheme`에 있습니다.

## 공통 컴포넌트

서비스에서 반복해서 쓰는 컴포넌트는 `src/components/`에 있습니다. `import { ... } from './components'`로 불러 씁니다.

| 컴포넌트 | 하는 일 |
| --- | --- |
| `AsyncButton` | `onClick`이 Promise를 돌려주면 끝날 때까지 자동으로 로딩을 표시하는 버튼 |
| `ResultTag` | 채점 결과(`accepted`, `wrong`, `timeout`, `judging`)를 색과 아이콘이 붙은 태그로 표시 |
| `CodeBlock` | 코드를 고정폭 글꼴과 어두운 배경으로 표시 |

아이콘은 [`@ant-design/icons`](https://ant.design/components/icon)에서 가져다 씁니다.
