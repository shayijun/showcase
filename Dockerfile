FROM node:24-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat && npm install -g pnpm@11.16.0

WORKDIR /app

# Install dependencies without project postinstall scripts. The docs source is
# generated after the full source tree is copied into the builder stage.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Rebuild the source code only when needed
FROM deps AS builder

WORKDIR /app

COPY . .
RUN pnpm rebuild @tailwindcss/oxide esbuild sharp unrs-resolver workerd
RUN pnpm exec fumadocs-mdx
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
