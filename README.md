# ShopSmart — Full-Stack E-Commerce + AWS DevOps

A production-ready e-commerce platform built with **React + NestJS**, deployed
on **AWS** entirely through GitHub Actions. The only manual step is adding two
secrets to GitHub — everything else (infrastructure, Docker builds, deployments,
cache invalidation) is fully automated.

---

## Architecture

```
User
 │
 ▼
CloudFront (CDN + HTTPS)
 ├─► S3               ← React SPA (Vite build)
 └─► ALB              ← API traffic (/api/*)
      │
      ▼
   ECS Fargate        ← NestJS API (Docker, auto-scaling)
      │
      ├─► RDS PostgreSQL   ← Primary database
      ├─► ElastiCache Redis ← Session cache / rate limiting
      └─► Secrets Manager  ← All sensitive env vars
```

All AWS resources are defined as **Terraform** code in `infrastructure/` and
provisioned automatically on every push to `main`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, Radix UI |
| Backend | NestJS, TypeORM, PostgreSQL, Redis |
| Auth | JWT (access + refresh tokens) |
| Infrastructure | Terraform, AWS ECS Fargate, RDS, ElastiCache, S3, CloudFront |
| CI/CD | GitHub Actions (CI + CD pipelines) |
| Containers | Docker (multi-stage build), ECR |
| Monitoring | CloudWatch Logs, Dashboards, Alarms, Auto Scaling |
| Code Quality | ESLint, Prettier, Husky, lint-staged |
| Testing | Vitest (unit + integration), Playwright (E2E), Jest (backend) |

---

## Repository Structure

```
.
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components (layout, product, cart, ui)
│   │   ├── pages/           # Route pages
│   │   ├── context/         # Cart, Wishlist, User context
│   │   ├── hooks/           # API hooks (useStorefront, etc.)
│   │   └── data/            # Demo fallback data
│   └── e2e/                 # Playwright E2E tests
├── server/                  # NestJS backend
│   ├── src/
│   │   └── modules/         # auth, users, products, cart, orders, payments…
│   ├── test/                # Unit + integration tests
│   └── docker/              # Production Dockerfile
├── infrastructure/          # Terraform (all AWS resources)
│   ├── vpc.tf               # VPC, subnets, security groups
│   ├── ecr.tf               # Container registry
│   ├── ecs.tf               # Fargate cluster + service + auto-scaling
│   ├── rds.tf               # PostgreSQL
│   ├── elasticache.tf       # Redis
│   ├── s3-cloudfront.tf     # Frontend hosting + CDN
│   ├── alb.tf               # Application Load Balancer
│   ├── iam.tf               # Roles and policies
│   ├── secrets.tf           # Secrets Manager
│   ├── monitoring.tf        # CloudWatch alarms + dashboard
│   └── outputs.tf           # Values consumed by CD pipeline
├── .github/
│   └── workflows/
│       ├── ci.yml           # Pull request checks (lint, test, build)
│       └── deploy-aws.yml   # Full CD pipeline (infra + API + frontend)
└── scripts/
    ├── bootstrap.sh         # One-time AWS setup helper
    └── checks.sh            # Local quality gate script
```

---

## Quick Start — Local Development

### Prerequisites
- Node.js 20+ (see `.nvmrc`)
- Docker + Docker Compose

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start local services (PostgreSQL + Redis)
docker compose -f server/docker-compose.yml up -d postgres redis

# 3. Copy env template and fill in values
cp .env.example server/.env

# 4. Start the backend (auto-rebuilds on save)
npm run start:dev --prefix server

# 5. Start the frontend (in a separate terminal)
npm run dev --prefix client
```

The site is now live at **http://localhost:5173** and the API at **http://localhost:3000/api/v1**.

---

## Deploying to AWS

> **All you need:** an AWS account and its Access Key ID + Secret Access Key.
> The pipeline provisions and manages everything else.

### Step 1 — Run the bootstrap script (one time only)

```bash
# Install prerequisites: AWS CLI v2, Terraform >= 1.5, GitHub CLI (optional)
aws configure              # enter your AWS credentials

export AWS_REGION=us-east-1
export GITHUB_REPO=your-github-username/sem6-devops-project

chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

This script:
1. Creates an S3 bucket for Terraform state
2. Creates a DynamoDB table for state locking
3. Runs `terraform apply` to provision all AWS resources
4. Prints the website URL and API URL

### Step 2 — Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret key |

That's it. You never need to touch AWS manually again.

### Step 3 — Push to main

```bash
git push origin main
```

The CD pipeline runs automatically and deploys everything:

```
bootstrap → terraform apply → build Docker image → push to ECR
    → deploy ECS service → build React app → upload to S3
    → invalidate CloudFront → health check → summary
```

Check the **Actions** tab to watch progress and get the live URL.

---

## CD Pipeline Stages

The `deploy-aws.yml` workflow runs on every push to `main`:

| Stage | What it does |
|---|---|
| **Bootstrap** | Creates S3 state bucket + DynamoDB lock if missing |
| **Infrastructure** | `terraform apply` — provisions/updates all AWS resources |
| **Build API** | Multi-stage Docker build, push `sha-<commit>` tag to ECR |
| **Deploy API** | Updates ECS task definition, rolling deployment with auto-rollback |
| **Deploy Frontend** | `npm run build` with live API URL, `aws s3 sync`, CloudFront invalidation |
| **Summary** | Posts website URL to GitHub Actions summary |

Auto-rollback is enabled via ECS deployment circuit breaker — if the new task
fails health checks, ECS rolls back to the previous revision automatically.

---

## CI Pipeline

The `ci.yml` workflow runs on every pull request:

- Lint frontend (`eslint`)
- Lint backend (`eslint`)
- Frontend tests (`vitest`)
- Backend tests (`jest` — unit + integration)
- Frontend build check
- Backend build check
- Playwright E2E tests

PRs cannot be merged if CI fails.

---

## Running Tests

```bash
# All tests
npm test

# Frontend only
npm run test --prefix client

# Backend only
npm test --prefix server

# E2E (requires running dev server)
npm run test:e2e --prefix client
```

---

## Infrastructure Cost Estimate

| Resource | ~Monthly Cost |
|---|---|
| ECS Fargate (256 CPU, 512 MB, 1 task) | ~$5 |
| RDS db.t3.micro (free tier 1st year) | $0 → $15 |
| ElastiCache cache.t3.micro | ~$12 |
| ALB | ~$18 |
| S3 + CloudFront | ~$1–2 |
| **Total** | **~$36–52 / month** |

To stay within free tier, you can delete ElastiCache and set `api_desired_count = 0`
when not presenting.

---

## Environment Variables

See `.env.example` for all available variables. In production, sensitive values
(database password, JWT secrets) are stored in **AWS Secrets Manager** and
injected into the ECS container at runtime — they never appear in code or CI logs.

---

## Implemented DevOps Practices

- **Infrastructure as Code** — all AWS resources in Terraform, version-controlled
- **Immutable deployments** — each deploy uses a unique Docker image tag (`sha-<commit>`)
- **Zero-downtime rolling deploys** — ECS minimum healthy 100%, circuit breaker + auto-rollback
- **Secrets management** — AWS Secrets Manager, never in env files or code
- **Container hardening** — non-root user, minimal Alpine base, image scanning on push
- **CDN caching** — long-lived cache for hashed assets, no-cache for `index.html`
- **Auto-scaling** — ECS service scales on CPU (target 70%)
- **Observability** — CloudWatch Logs, Dashboards, Alarms (5xx errors, CPU, RDS storage)
- **Pre-commit hooks** — Husky + lint-staged (lint + format on every commit)
- **Dependabot** — automated dependency PRs
- **Branch protection** — CI must pass before merge
- **PR template** — structured change descriptions

---

## Documentation

- [Architecture](docs/architecture.md)
- [Workflow](docs/workflow.md)
- [Deployment](docs/deployment.md)
- [Contributing](CONTRIBUTING.md)
