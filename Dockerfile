FROM node:22.13.1-alpine AS base
WORKDIR /app
ENV PNPM_HOME='/pnpm' PATH="/pnpm:$PATH" CI='1'
COPY package.json pnpm-lock.yaml ./
RUN corepack enable

# ==============================================================================

FROM base AS dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm i --frozen-lockfile --ignore-scripts --prefer-offline --prod

# ==============================================================================

FROM base AS builder
COPY . .
COPY --from=dependencies /app/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm i --frozen-lockfile --ignore-scripts --prefer-offline && pnpm build

# ==============================================================================

FROM node:22.13.1-alpine
WORKDIR /app
ENV CI=1 DO_NOT_TRACK=1 NODE_ENV=production PORT=3000
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist/ .
USER node
EXPOSE ${PORT}
CMD ["node", "index"]
