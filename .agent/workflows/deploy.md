---
description: Deploy application to Render production
---

# Deploy to Production

Pre-deployment checks and deployment workflow.

## Pre-deployment Checks

// turbo

1. Run all tests

```bash
cd server && npm test && cd ../client && npm test
```

// turbo 2. Run linting

```bash
cd server && npm run lint && cd ../client && npm run lint
```

// turbo 3. Build server (TypeScript check)

```bash
cd server && npm run build
```

// turbo 4. Build client (production bundle)

```bash
cd client && npm run build
```

## Deploy

5. Commit all changes

```bash
git add . && git status
```

6. Push to main branch (triggers Render auto-deploy)

```bash
git commit -m "chore: deploy to production" && git push origin main
```

## Post-deployment Verification

7. Wait for Render to deploy (~3-5 minutes), then verify:
   - Backend health: `curl https://shopsmart-backend.onrender.com/api/v1/health`
   - Frontend: Visit the static site URL in browser
   - Check Render dashboard for any errors
