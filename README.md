# COTE_PlatForm

코딩테스트 준비 플랫폼. **문제 풀이 → 자동 오답노트 → 복습**으로 이어지는 학습 루프를 제공한다.

- 기획안: [docs/PLANNING.md](docs/PLANNING.md)
- 현재 단계: **1차(MVP)** — 회원가입/로그인, 문제 목록·상세, 코드 에디터, 채점(Python·JavaScript·C++·Java), 예제 실행, 제출 이력, 자동 오답노트, 대시보드
- 모바일(`apps/mobile`)은 코드를 쓰지 않는다. 문제를 읽고 **풀이를 말로 설명하면 AI 코치가 문답으로 이끄는** 흐름만 제공한다.

## 구조

```
apps/
  web/     Next.js 15 + Tailwind + Monaco     (포트 3000)
  mobile/  Expo(React Native) 말로 풀기 앱     (npm 으로 별도 관리)
  api/     NestJS REST API                    (포트 4000)
  judge/   BullMQ 채점 워커 (local | docker 실행기)
packages/
  db/      Prisma 스키마·마이그레이션·seed
problems/  문제 데이터 (problem.md + tests/*.in|out + solution.py)
```

흐름: 브라우저 → API가 제출을 저장하고 Redis 큐에 넣음 → 워커가 격리 실행 후 결과 저장 → 브라우저가 폴링으로 결과 표시. 최종 제출이 정답이 아니면 오답노트에 자동 등록되고, 재도전해 정답을 받으면 해결로 바뀐다.

## 로컬 실행

요구사항: Node 22, pnpm 10, PostgreSQL, Redis. 채점 워커의 `local` 모드는 호스트에 `python3`, `node`, `g++`, `javac/java`가 있어야 한다.

```bash
pnpm install
cp .env.example .env            # DATABASE_URL, REDIS_URL 등 확인

pnpm --filter @cote/db generate
pnpm --filter @cote/db migrate  # 또는 migrate:dev
pnpm --filter @cote/db seed     # problems/ 를 DB에 적재

pnpm --filter @cote/api dev     # http://localhost:4000
pnpm --filter @cote/judge dev   # 채점 워커
pnpm --filter @cote/web dev     # http://localhost:3000
```

### Docker Compose

```bash
docker compose up --build
docker compose exec api sh -c "cd ../../packages/db && pnpm migrate && pnpm seed"
```

Compose의 워커는 `JUDGE_EXECUTOR=docker`로 동작해 언어별 이미지에서 네트워크 차단·메모리/CPU/PID 제한·읽기 전용 파일시스템으로 격리 실행한다. 처음 채점 시 이미지(`python:3.11-alpine`, `node:22-alpine`, `gcc:13`, `eclipse-temurin:21-jdk-alpine`)를 내려받는다.

## 디자인

색, 글꼴, 라운드, 그림자 같은 디자인 토큰은 `apps/web/app/globals.css` 상단의 CSS 변수에 모여 있다(라이트/네이비 다크 두 벌). `dev` 브랜치 `frontend/src/theme.ts`의 Ant Design 토큰을 옮긴 것이며, Tailwind 유틸리티(`bg-surface`, `text-primary`, `shadow-card` 등)로 노출된다. 테마는 헤더의 라이트/다크 토글로 바꾸고 브라우저에 저장된다. 공용 UI 프리미티브는 `apps/web/components/ui.tsx`, 태그류는 `components/badges.tsx`, 에디터 색은 `components/monaco-setup.ts`에 있다.

## 문제 추가

`problems/<slug>/` 에 다음을 둔다.

- `problem.md` — 첫 줄에 `<!-- meta {"title","difficulty","tags","timeLimitMs","memoryLimitMb","samples"} -->`, 이어서 마크다운 본문
- `tests/1.in`, `tests/1.out`, … — 앞에서 `samples`개는 사용자에게 공개되는 예제
- `solution.py` — 참조 풀이 (선택). `python3 problems/check.py` 로 모든 테스트케이스가 참조 풀이와 일치하는지 검증한다

그 후 `pnpm --filter @cote/db seed` 를 다시 실행하면 갱신된다(제출 이력은 유지).

## API 요약

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/auth/signup`, `/auth/login` | JWT 발급 |
| GET | `/auth/me` | 내 정보 |
| GET | `/problems?tag=&difficulty=&status=&q=&page=` | 문제 목록 (로그인 시 풀이 상태 포함) |
| GET | `/problems/tags`, `/problems/:id` | 태그 목록, 문제 상세(예제 포함) |
| POST | `/problems/:id/run` | 예제 실행 (샘플만 채점, 통계 미반영) |
| POST | `/problems/:id/submit` | 최종 제출 |
| GET | `/submissions`, `/submissions/:id` | 내 제출 이력·상세 |
| GET | `/review`, `/review/due`, `/review/:id` | 오답노트 목록, 오늘 복습, 상세 |
| PATCH | `/review/:id` | 메모 저장 |
| GET | `/dashboard` | 요약 통계 |
| GET | `/coach/meta`, `/coach/sessions`, `/coach/sessions/:problemId` | 코치 단계·인사말, 내 코치 세션 목록·상세 (모바일) |
| POST | `/coach/sessions/:problemId/messages` | 말로 설명한 내용을 보내고 코치 답변 받기 |
| DELETE | `/coach/sessions/:problemId` | 코치 세션 초기화 |

## 모바일 (말로 풀기)

```bash
cd apps/mobile && npm install && npx expo start
```

자세한 내용은 [apps/mobile/README.md](apps/mobile/README.md). 코치는 API 의 `ANTHROPIC_API_KEY` 가 설정돼 있으면 Claude(`COACH_MODEL`, 기본 `claude-sonnet-5-5`)가, 없으면 정해진 순서로 답하는 목 코치가 동작한다.

## 테스트

```bash
python3 problems/check.py          # 문제 테스트케이스 검증
pnpm --filter @cote/judge test     # 실행기 판정(AC/WA/TLE/RE/CE) 검증, DB 불필요
pnpm --filter @cote/api typecheck
pnpm --filter @cote/web build
cd apps/mobile && npm run typecheck
```
