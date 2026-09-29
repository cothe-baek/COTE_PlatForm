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
