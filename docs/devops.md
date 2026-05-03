# DevOps guide

This document is the **single map** for how the ShopSmart repo is built, run locally, tested in CI, and deployed to **AWS (Terraform → ECR → EKS)**. Use it together with [`architecture.md`](./architecture.md) for code layout and [`workflow.md`](./workflow.md) for day-to-day git habits.

---

## 1. What runs where

| Surface | Stack | How API is reached |
|--------|--------|---------------------|
| **Local (split terminals)** | Vite dev server + Nest `start:dev` | Browser → `http://localhost:5173` → Vite **proxy** `/api` → `http://localhost:3000` ([`client/vite.config.js`](../client/vite.config.js)). |
| **Local (Docker Compose)** | All services on one Docker network | Client container uses `VITE_BACKEND_ORIGIN=http://server:3000`; same proxy pattern ([`docker-compose.yml`](../docker-compose.yml)). |
| **Vitest** | jsdom + **MSW node** | No real HTTP; handlers in [`client/src/mocks/handlers.js`](../client/src/mocks/handlers.js). |
| **Playwright E2E** | Real Chromium + **MSW browser worker** | Dev server started with `VITE_ENABLE_MSW=true` ([`client/playwright.config.js`](../client/playwright.config.js)). |
| **EKS production** | **One container image**: Nest serves API **and** static Vite `dist` from `/` | Browser hits **one** `http://<LoadBalancer-DNS>/`; API is same-origin under `/api/v1` ([`server/docker/Dockerfile`](../server/docker/Dockerfile), [`server/src/main.ts`](../server/src/main.ts)). |

---

## 2. Repository layout (DevOps-relevant)

```
client/                 # Vite + React storefront
  vite.config.js        # dev proxy: /api → VITE_BACKEND_ORIGIN (default localhost:3000)
  Dockerfile.dev        # used by docker-compose client service
  e2e/                  # Playwright specs
server/                 # NestJS API
  docker/Dockerfile     # production image (build context = repo root)
  docker/Dockerfile.dev # hot-reload API for compose
k8s/                    # EKS manifests (namespace, deployment, service)
terraform/              # VPC, EKS, ECR, RDS, S3 rubric bucket
terraform/bootstrap/  # one-time S3 backend for Terraform state
.github/workflows/     # CI + deploy pipeline
docker-compose.yml      # postgres + redis + server + client for full stack local
render.yaml             # optional Render.com layout (not used by EKS pipeline)
```

---

## 3. Local development

### 3.1 Install dependencies

```bash
./scripts/bootstrap.sh
```

Or manually: `npm ci --prefix client` and `npm ci --prefix server`.

### 3.2 Option A — two terminals (fastest iteration)

1. **Database & Redis** must match what the server expects (from [`server/.env.example`](../server/.env.example)): typically Postgres on `localhost:5432` and Redis if you enable cache.
2. **API**: `npm run start:dev --prefix server` (port **3000** by default).
3. **Client**: `npm run dev --prefix client` (port **5173**).  
   - `VITE_BACKEND_ORIGIN` defaults to `http://localhost:3000` in Vite config.  
   - API base path in the client defaults to `/api/v1` ([`client/src/lib/storefront.js`](../client/src/lib/storefront.js)).

### 3.3 Option B — Docker Compose (full stack, no local Node DB)

From the **repo root**:

```bash
docker compose up --build
```

- **Postgres**: `localhost:5432`, db `ecommerce`, user/password `postgres` / `postgres`.
- **Redis**: `localhost:6379` (server uses hostname `redis` inside compose).
- **API**: `http://localhost:3000`
- **Client**: `http://localhost:5173` with `CORS_ORIGIN=http://localhost:5173` on the server container.

Use `docker compose down -v` to wipe volumes.

### 3.4 Frontend without a backend

Vitest and many UI flows use **MSW**. For browser E2E, Playwright starts Vite with `VITE_ENABLE_MSW=true`. If MSW fails to register, the app still mounts ([`client/src/main.jsx`](../client/src/main.jsx)); unregister stale service workers in Chrome **Application → Service Workers** if you see odd caching.

---

## 4. Production API image (ECR / EKS)

The **same** Docker image contains:

1. **Built Vite app** copied to `/app/public` in the image.
2. **Nest `dist`** for `/api/v1/...`.

When `NODE_ENV=production` **and** `public/index.html` exists, Nest:

- Serves static assets and SPA fallback for **GET/HEAD** outside `/api`, `sitemap.xml`, and `robots.txt`.
- Keeps the versioned API under `/api/v1`.

**CORS:** For that bundled mode, the server uses **dynamic origin reflection** (`origin: true` in Nest terms) so you do **not** need to inject the Load Balancer hostname into `CORS_ORIGIN`. For local dev (API only, no bundled `public/`), `CORS_ORIGIN` must match the browser origin (default `http://localhost:5173`).

Build manually (same as CI):

```bash
docker build -t shopsmart-api:local -f server/docker/Dockerfile .
```

---

## 5. Kubernetes (`k8s/`)

Apply order (also what CI does after `terraform apply`):

1. [`k8s/namespace.yaml`](../k8s/namespace.yaml) — namespace `shopsmart`.
2. **Secret** `shopsmart-api-env` — key/value env for the pod (created in CI from Terraform outputs).
3. **Deployment** [`k8s/deployment.yaml`](../k8s/deployment.yaml) — `IMAGE_PLACEHOLDER` replaced with `${ECR_URL}:${GITHUB_SHA}`; **2 replicas**; rolling update tuned for small clusters (`maxSurge: 0`, `maxUnavailable: 1`).
4. **Service** [`k8s/service.yaml`](../k8s/service.yaml) — `type: LoadBalancer`, port 80 → container 3000.

**Probes** (must stay in sync with Nest routes):

- Liveness: `GET /api/v1/health/liveness`
- Readiness: `GET /api/v1/health/readiness` (includes DB check)

**Critical env (cluster):**

| Variable | Notes |
|----------|--------|
| `DATABASE_SSL=true` | Required for RDS; without TLS, Postgres rejects connections. |
| `REDIS_HOST` | **Leave empty** in K8s unless you run Redis in-cluster; empty disables TypeORM Redis cache (see pipeline comments in [`.github/workflows/rubric-pipeline.yml`](../.github/workflows/rubric-pipeline.yml)). |
| `DATABASE_SYNCHRONIZE` / `RUN_DB_SEED` | CI sets `true` for first-time schema + seed; tighten for real production. |

**kubectl** after Terraform:

```bash
aws eks update-kubeconfig --region "$AWS_REGION" --name "$(terraform -chdir=terraform output -raw cluster_name)"
kubectl get pods,svc -n shopsmart
```

Get the public URL:

```bash
kubectl get svc shopsmart-api -n shopsmart -o jsonpath='{.status.loadBalancer.ingress[0].hostname}{"\n"}'
```

Then open `http://<hostname>/` (storefront + API same host).

---

## 6. Terraform (AWS)

Root module: [`terraform/`](../terraform/).

**Creates (high level):**

- S3 “rubric” bucket (encrypted, versioned, no public access).
- VPC + private subnets (nodes) + public subnets (LBs).
- **EKS** cluster + node group + add-ons.
- **ECR** repository for the API image.
- **RDS PostgreSQL** in private subnets for the API.

**Remote state:** one-time [`terraform/bootstrap/`](../terraform/bootstrap/) apply creates an S3 bucket; put its name in GitHub **variable** `TF_STATE_BUCKET`. Terraform **1.11+** required (`use_lockfile` on S3 backend).

**Optional lab variables:** `EKS_CLUSTER_IAM_ROLE_ARN` / `EKS_NODE_IAM_ROLE_ARN` when your account cannot create IAM roles (see tables in [`deployment.md`](./deployment.md)).

Outputs used by CI: `ecr_repository_url`, `cluster_name`, database host/port/name/user, `database_password`, `jwt_secret` (sensitive).

Full IAM and teardown notes: [`deployment.md`](./deployment.md).

---

## 7. GitHub Actions (`.github/workflows/rubric-pipeline.yml`)

**Jobs:**

1. **client** — `npm ci`, lint, Vitest, build.
2. **server** — `npm ci`, lint, Jest, build.
3. **e2e** — Playwright (needs client job green).
4. **terraform-and-release** — needs all three; on **`push` to `main`** only:
   - `terraform init` (remote backend if `TF_STATE_BUCKET` set).
   - `terraform plan` / `apply`.
   - Build & push Docker image to ECR (`server/docker/Dockerfile` from repo root).
   - `kubectl apply` namespace, rendered deployment, service; create/apply secret for env.

**Secrets / variables:** see section 8 in [`deployment.md`](./deployment.md) (AWS keys, region, `TF_STATE_BUCKET`, optional role ARNs).

**PRs:** plan may use **local** Terraform backend when `TF_STATE_BUCKET` is unset. **Main** push fails fast if `TF_STATE_BUCKET` is missing, so you never apply without remote state.

---

## 8. Environment variables cheat sheet

### Client (Vite)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | API prefix (default `/api/v1`; set in Docker production build). |
| `VITE_BACKEND_ORIGIN` | Dev proxy target (Compose: `http://server:3000`). |
| `VITE_ENABLE_MSW` | `true` for Playwright / optional local mocked API. |

### Server (Nest)

| Variable | Purpose |
|----------|---------|
| `PORT` | Default `3000`. |
| `DATABASE_*` | Host, port, name, user, password, `DATABASE_SSL`, `DATABASE_SYNCHRONIZE`. |
| `REDIS_*` | Optional; **empty `REDIS_HOST`** disables Redis-backed query cache. |
| `JWT_SECRET` | Required; min 32 chars in production validation. |
| `CORS_ORIGIN` | Dev browser origin when **not** serving bundled storefront. |
| `NODE_ENV` | `production` enables static storefront when `public/index.html` exists. |

---

## 9. Render.com (`render.yaml`)

[`render.yaml`](../render.yaml) describes a **split** backend + static frontend on Render. That path is **independent** of the EKS rubric pipeline. If you use Render, align env vars (`VITE_API_URL` there vs `VITE_API_BASE_URL` locally) with how the client build resolves the API base URL.

---

## 10. Troubleshooting

| Symptom | Things to check |
|---------|------------------|
| **Pods CrashLoop** on RDS | `DATABASE_SSL=true`, security groups allow EKS → RDS:5432, credentials match Terraform outputs. |
| **Readiness never passes** | DB unreachable, or `REDIS_HOST=localhost` in K8s (hangs). |
| **Rollout Pending (quota)** | One-node cluster + default surge; manifests already cap surge; check `kubectl describe pod`. |
| **Blank page + MSW** | Service worker / `VITE_ENABLE_MSW`; unregister SW; app still mounts after MSW failure. |
| **CORS in local dev** | `CORS_ORIGIN` must match Vite origin (`http://localhost:5173`). |
| **502 / wrong API in prod** | Hit the **LoadBalancer DNS** root URL; confirm image includes `public/index.html` from client build. |
| **POST `/cart/items` hangs or 429** | Send **`x-session-id`** (allowed in CORS). **`HealthController` uses `@SkipThrottle()`** so kube/LB probes do not share the global rate-limit bucket with real traffic (SNAT can make every probe look like one IP). Pool **`min: 0`** avoids starving small RDS. Use **`curl -m 30 -v`** to see timeouts vs 429 vs RST. |

### Verify the API on the load balancer

```bash
HOST="<paste-elb-dns>"
# Optional: force a new TCP hop from curl to the LB (helps debug classic ELB keep-alive quirks)
CURL_API=(curl -fsS -H "Connection: close")

"${CURL_API[@]}" -m 15 "http://${HOST}/api/v1/health/liveness"
"${CURL_API[@]}" -m 15 "http://${HOST}/api/v1/health/readiness"
"${CURL_API[@]}" -m 30 -X POST "http://${HOST}/api/v1/cart/items" \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-$(date +%s)" \
  -d '{"productId":"<uuid>","variantId":"<uuid>","quantity":1}'
```

The production image sets **`Connection: close` on every `/api/*` response** and uses a **shorter `keepAliveTimeout`** so Node recycles sockets before stale ELB ↔ pod pairs cause empty replies (`curl 52`) or probe timeouts (`curl 28`).

Use `productId` / `variantId` from your seeded catalog (e.g. `GET /api/v1/products` after deploy). A **404** is immediate (unknown variant); a **hang** usually means DB connectivity, pool exhaustion, or a second replica stuck on startup DDL—this repo defaults to **one replica** while `DATABASE_SYNCHRONIZE=true` in CI.

---

## 11. Related docs

- **AWS deploy detail & secrets tables:** [`deployment.md`](./deployment.md)  
- **Git / hooks / MSW workflow:** [`workflow.md`](./workflow.md)  
- **Code structure:** [`architecture.md`](./architecture.md)
