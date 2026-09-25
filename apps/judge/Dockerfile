# 채점 워커. JUDGE_EXECUTOR=docker 로 실행하려면 호스트의 docker 소켓을 마운트해야 한다.
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/db/package.json packages/db/
COPY apps/judge/package.json apps/judge/
RUN pnpm install --frozen-lockfile --filter @cote/db --filter @cote/judge
COPY packages/db packages/db
COPY apps/judge apps/judge
RUN pnpm --filter @cote/db generate && pnpm --filter @cote/db build && pnpm --filter @cote/judge build

FROM base AS runtime
ENV NODE_ENV=production
RUN apk add --no-cache docker-cli
COPY --from=build /app /app
WORKDIR /app/apps/judge
CMD ["node", "dist/index.js"]
