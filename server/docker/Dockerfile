# Build from repository root so we can bundle the Vite client into the API image:
#   docker build -f server/docker/Dockerfile .

# --- Client (Vite): same-origin API calls via /api/v1 ---
FROM node:20-alpine AS client

WORKDIR /client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# --- API (Nest) ---
FROM node:20-alpine AS server

WORKDIR /app

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# --- Runtime ---
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=server /app/dist ./dist
COPY --from=server /app/node_modules ./node_modules
COPY --from=server /app/package*.json ./
COPY --from=client /client/dist ./public

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health/liveness', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/main"]
