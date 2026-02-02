---
name: deploy
description: Deploy the application to Render production environment
---

# Deployment Skill

This skill provides instructions for deploying the ShopSmart e-commerce application to Render.

## Prerequisites

Before deploying, ensure:

1. All tests pass (`npm test` in both client and server)
2. Code is linted (`npm run lint` in both client and server)
3. Environment variables are configured in Render dashboard

## Deployment Commands

### Deploy via Render Dashboard

The application auto-deploys when pushing to the main branch. For manual deployment:

```bash
# Trigger deploy via Render API (if webhook configured)
curl -X POST https://api.render.com/deploy/srv-xxx?key=xxx
```

### Pre-deployment Checklist

// turbo

1. Run server tests

```bash
cd server && npm test
```

// turbo 2. Run client tests

```bash
cd client && npm test
```

// turbo 3. Build client to verify no build errors

```bash
cd client && npm run build
```

// turbo 4. Build server to verify TypeScript compilation

```bash
cd server && npm run build
```

5. Commit and push to main branch

```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

## Render Configuration

The `render.yaml` at project root defines the infrastructure:

| Service            | Type        | Build Command                               | Start Command            |
| ------------------ | ----------- | ------------------------------------------- | ------------------------ |
| shopsmart-backend  | Web Service | `cd server && npm install`                  | `cd server && npm start` |
| shopsmart-frontend | Static Site | `cd client && npm install && npm run build` | N/A                      |

## Rollback Procedure

If deployment fails:

1. Go to Render Dashboard → Service → Deploys
2. Click on the last successful deploy
3. Click "Rollback to this deploy"

## Environment Variables

Required environment variables in Render:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret (use strong random value)
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Frontend URL

## Monitoring Post-Deploy

// turbo

1. Check server health endpoint

```bash
curl https://shopsmart-backend.onrender.com/api/v1/health
```

2. Verify frontend is accessible at static site URL
3. Check Render logs for any startup errors
