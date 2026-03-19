# ──────────────────────────────────────────────────────────────────────────────
# Multi-stage production Dockerfile for ShopSmart API (NestJS)
# ──────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Install only production dependencies (faster CI layer caching)
COPY package*.json ./
RUN npm ci --omit=dev && \
    # Copy the dev-deps separately so we can build TypeScript
    npm ci

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

ARG BUILD_DATE
ARG GIT_COMMIT=unknown

WORKDIR /app

# Copy all deps (includes devDependencies needed to compile TypeScript)
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 3: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: update base packages
RUN apk --no-cache upgrade

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nestjs -u 1001

WORKDIR /app

# Copy compiled output and production node_modules only
COPY --from=builder --chown=nestjs:nodejs /app/dist        ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Install production deps in final image
RUN npm ci --omit=dev && \
    npm cache clean --force

USER nestjs

EXPOSE 3000

# OCI labels
LABEL org.opencontainers.image.title="ShopSmart API"
LABEL org.opencontainers.image.description="ShopSmart e-commerce backend"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health/liveness', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/main"]
