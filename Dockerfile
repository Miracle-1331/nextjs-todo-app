ARG NODE_VERSION=24-slim

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* .npmrc* ./
RUN --mount=type=cache,target=/root/.npm \
    if   [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
    elif [ -f yarn.lock ];         then corepack enable yarn && yarn install --frozen-lockfile --production=false; \
    elif [ -f pnpm-lock.yaml ];    then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else echo "No lockfile found" && exit 1; fi

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN if   [ -f package-lock.json ]; then npm run build; \
    elif [ -f yarn.lock ];         then corepack enable yarn && yarn build; \
    elif [ -f pnpm-lock.yaml ];    then corepack enable pnpm && pnpm build; \
    else echo "No lockfile found" && exit 1; fi

# ─── Stage 3: Production runtime ─────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy only the standalone output and static assets
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

RUN mkdir -p .next public && chown -R node:node .next public

USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
