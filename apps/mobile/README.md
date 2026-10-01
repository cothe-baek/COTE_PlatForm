# COTE 모바일 — 말로 풀기

모바일에서는 코드를 쓰지 않는다. 문제를 읽고 **풀이 방법을 말로 설명**하면 AI 코치가 질문과 힌트로 정답까지 이끌어 준다. 접근 방법 → 시간 복잡도 → 예외 상황 → 정리 네 단계를 모두 설명하면 풀이 요약이 남는다.

Expo(React Native) + Expo Router. 색과 글자 크기는 웹(`apps/web/app/globals.css`)과 같은 토큰을 쓴다.

## 실행

```bash
cd apps/mobile
npm install                 # pnpm 워크스페이스에 포함되지 않는다
cp .env.example .env        # EXPO_PUBLIC_API_URL: 기기에서는 PC 의 LAN IP
npx expo start              # Expo Go 로 QR 을 찍거나 i / a 키로 시뮬레이터, w 키로 웹 미리보기
npm run typecheck
```

API(`apps/api`)와 채점 워커가 떠 있어야 한다. 계정은 웹과 같다.

## 화면

| 경로 | 파일 | 내용 |
| --- | --- | --- |
| `/login` | `src/app/login.tsx` | 로그인 · 회원가입 |
| `/` | `src/app/index.tsx` | 문제 목록, 라이트/다크 전환, 설명 진행 상태 |
| `/problems/[id]` | `src/app/problems/[id]/index.tsx` | 문제 설명과 "말로 풀이 시작하기" |
| `/problems/[id]/chat` | `src/app/problems/[id]/chat.tsx` | 코치와 대화. 대화는 서버에 저장되어 이어서 할 수 있고 "다시"로 초기화한다 |

## 안드로이드 빌드

네이티브 프로젝트(`android/`)는 커밋하지 않고 빌드할 때 생성한다(Continuous Native Generation). 설정은 `app.json`(패키지명 `com.cothebaek.cote`, 아이콘, HTTP 허용)과 `eas.json`(빌드 프로필)에 있다.

### 1. EAS 클라우드 빌드 (권장, Android Studio 불필요)

```bash
npm install -g eas-cli          # 또는 npx eas-cli
eas login                        # expo.dev 계정 (무료)
cd apps/mobile
eas init                         # 처음 한 번. app.json 에 projectId 가 추가된다
npm run build:android            # preview 프로필: 설치용 .apk
```

끝나면 터미널과 expo.dev 대시보드에 다운로드 링크와 QR 이 나온다. 폰에서 열어 설치하면 된다(출처를 알 수 없는 앱 허용 필요).

- `eas.json` 의 `preview.env.EXPO_PUBLIC_API_URL` 을 **폰에서 접근 가능한 API 주소**로 바꾼다. 같은 와이파이의 PC 라면 `http://<PC의 LAN IP>:4000`, 서버에 올렸다면 그 주소. 빌드 시점에 앱에 박히므로 바꾸면 다시 빌드한다.
- HTTP(비 HTTPS) API 를 쓰기 위해 `expo-build-properties` 로 `usesCleartextTraffic` 을 켜 두었다. 운영 배포 전에 HTTPS 로 바꾸고 끄는 것을 권한다.
- 스토어용 `.aab` 는 `npm run build:android:prod` (버전 코드 자동 증가).

### 2. 로컬 빌드 (Android Studio 설치 시)

```bash
# Android Studio 로 SDK 와 에뮬레이터를 설치하고 ANDROID_HOME 을 잡은 뒤
cd apps/mobile
npm run prebuild:android         # android/ 생성
npm run android                  # 디버그 빌드 후 연결된 기기·에뮬레이터에 설치·실행
# 또는 EAS 를 로컬에서: npm run build:android:local  → .apk 파일
```

### 3. 빌드 없이 바로 보기

`npx expo start` 후 폰의 Expo Go 앱으로 QR 을 찍는다. 빌드가 필요 없고 코드를 고치면 즉시 반영된다. 단 `.env` 의 `EXPO_PUBLIC_API_URL` 을 PC 의 LAN IP 로 둬야 한다.

## 코치

서버의 `POST /coach/sessions/:problemId/messages` 가 답한다. `ANTHROPIC_API_KEY` 가 설정돼 있으면 Claude 가 문제와 대화를 보고 답하고, 없으면 정해진 순서로 답하는 목 코치가 동작한다(개발용, 사용자의 말을 이해하지 않는다). 프롬프트는 `apps/api/src/coach/coach.prompt.ts` 에 있다.

## 알아 둘 점

- 글꼴은 기기 기본 글꼴을 쓴다. Pretendard 를 쓰려면 `expo-font` 로 글꼴 파일을 넣어야 한다.
- 테마는 처음에 기기 설정을 따르고, 목록 화면에서 바꾼 값은 저장하지 않는다.
- 새 네이티브 모듈을 추가하면 Expo Go 대신 개발 빌드(`eas build --profile development`)가 필요할 수 있다.
- 앱 아이콘은 `assets/` 의 PNG 다. 웹 favicon 과 같은 "< >" 글리프를 쓴다.
