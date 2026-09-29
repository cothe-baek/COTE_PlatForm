# COTE 모바일

코드를 직접 쓰지 않고, 문제를 읽은 뒤 풀이 방법을 말로 설명하는 모바일 앱입니다. AI 코치가 질문과 힌트로 정답까지 이끌어 줍니다.

Expo(React Native) + Expo Router로 만들었고, 색과 글자 크기는 웹(`frontend/src/theme.ts`)과 같은 값을 씁니다.

## 실행

```bash
cd mobile
npm install
npx expo start   # Expo Go 앱으로 QR 코드를 찍거나 i / a 키로 시뮬레이터를 연다
```

타입 검사는 `npm run typecheck`로 합니다.

## 화면

| 경로 | 파일 | 내용 |
| --- | --- | --- |
| `/` | `src/app/index.tsx` | 문제 목록, 라이트/다크 전환 |
| `/problems/[id]` | `src/app/problems/[id]/index.tsx` | 문제 설명과 "말로 풀이 시작하기" |
| `/problems/[id]/chat` | `src/app/problems/[id]/chat.tsx` | 코치와 대화하며 접근 방법 → 시간 복잡도 → 예외 상황 → 정리 네 단계를 설명 |

## 코치

AI 서버가 아직 없어서 `src/data/mockCoach.ts`의 `mockAskCoach`가 정해진 순서로 답합니다. 사용자가 쓴 내용을 이해하지는 않습니다.
서버가 붙으면 `coachSystemPrompt(problem)`을 시스템 프롬프트로 Claude를 부르고, 같은 `CoachReply` 모양(`reply`, `progress`, `solved`, `summary`)으로 돌려주면 됩니다.

## 알아 둘 점

- 문제 데이터(`src/data/problems.ts`)는 웹의 예제 문제를 복사한 것입니다. 해결 표시는 앱을 끄면 처음 상태로 돌아갑니다.
- 글꼴은 기기 기본 글꼴을 씁니다. Pretendard를 쓰려면 `expo-font`로 글꼴 파일을 넣어야 합니다.
- 테마는 처음에 기기 설정을 따르고, 목록 화면에서 바꾼 값은 저장하지 않습니다.
