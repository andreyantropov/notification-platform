# --- Build Arguments ---
    ARG NODE_VERSION=24.14.0

# --- Stage 1: Pruner ---
    FROM node:${NODE_VERSION}-alpine AS pruner
    WORKDIR /app
    ARG SERVICE_NAME
    RUN npm install -g turbo
    COPY . .
    RUN turbo prune ${SERVICE_NAME} --docker

# --- Stage 2: Builder ---
    FROM node:${NODE_VERSION}-alpine AS builder
    WORKDIR /app
    ARG SERVICE_NAME
    COPY --from=pruner /app/out/json/ .
    COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
    COPY --from=pruner /app/tsconfig.base.json ./tsconfig.base.json
    ENV PNPM_HOME="/pnpm"
    ENV PATH="$PNPM_HOME:$PATH"
    RUN corepack enable
    RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
    COPY --from=pruner /app/out/full/ .
    RUN npx turbo run build --filter=${SERVICE_NAME}
    RUN pnpm --filter=${SERVICE_NAME} --prod deploy /app/deploy --legacy

# --- Stage 3: Runner ---
    FROM node:${NODE_VERSION}-alpine AS runner
    WORKDIR /app
    RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
    ARG SERVICE_NAME
    ENV NODE_ENV=production
    COPY --from=builder --chown=nodejs:nodejs /app/deploy ./
    USER nodejs
    CMD ["node", "--import", "./dist/instrumentation.js", "./dist/index.js"]