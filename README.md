# ShopSmart DevOps Project

Full-stack e-commerce coursework project with a React storefront, NestJS backend, automated CI, test reports, Terraform on AWS (S3 rubric bucket, VPC, RDS, ECR, EKS), and GitHub Actions that build the API container and roll it out to Kubernetes.

## Repository Structure

- `client/`: React + Vite frontend
- `server/`: NestJS backend
- `terraform/`: AWS infrastructure (S3, VPC, RDS, EKS, ECR)
- `terraform/bootstrap/`: one-time S3 + DynamoDB for Terraform remote state
- `k8s/`: Kubernetes manifests for the API on EKS
- `docs/`: architecture, workflow, and deployment explanations
- `scripts/`: idempotent setup, validation, and deployment scripts
- `.github/workflows/`: CI and rubric pipeline

## Implemented Against The Rubric

- GitHub Actions on `push` and `pull_request` with **unit and integration tests** and **JUnit report artifacts** (Vitest + `jest-junit`)
- **Terraform**: `fmt`, `init`, `validate`, `plan`; `apply` on `main` when remote state variables are configured
- **S3**: globally unique bucket name, versioning, encryption, public access blocked
- **Docker**: multi-stage production image for the API with non-root user and `HEALTHCHECK` ([`server/docker/Dockerfile`](server/docker/Dockerfile))
- **ECR** push and **EKS** rollout with **LoadBalancer** verification (`curl` to liveness)
- **Kubernetes**: namespace `shopsmart`, 2 replicas, resource limits, liveness and readiness probes
- Dependabot, PR template, contributing guide, Husky + `lint-staged`, and written docs

## Quick Start

```bash
./scripts/bootstrap.sh
npm run dev --prefix client
npm run start:dev --prefix server
```

## Validation

```bash
./scripts/checks.sh
```

Or run the commands individually:

```bash
npm run lint --prefix client
npm run test:ci --prefix client
npm run lint --prefix server
npm run test:ci --prefix server
```

## Test Layers

- Frontend unit tests: `client/src/lib/storefront.unit.test.js` using MSW node handlers
- Frontend integration tests: `client/src/App.integration.test.jsx` using MSW node handlers
- Frontend E2E tests: `client/e2e/storefront.spec.js` using the MSW browser worker
- Backend unit tests: `server/test/unit/categories.service.spec.ts`
- Backend integration tests: `server/test/integration/categories.controller.spec.ts`

## CI/CD

- **Rubric pipeline** (tests → Terraform → ECR → EKS): [`.github/workflows/rubric-pipeline.yml`](.github/workflows/rubric-pipeline.yml)
- Dependabot: [`.github/dependabot.yml`](.github/dependabot.yml)

## Documentation

- [Architecture](docs/architecture.md)
- [Workflow](docs/workflow.md)
- [Deployment](docs/deployment.md) — AWS secrets, bootstrap, EKS, teardown
- [Contributing](CONTRIBUTING.md)

## Notes

- The repository initially had a very short commit history. The new contribution policy and PR template enforce better commit hygiene going forward, but past history cannot be retroactively made “frequent throughout the project” without rewriting repository history.
- The storefront now uses API-first hooks with a safe demo fallback so the UI still works during local frontend-only runs.
