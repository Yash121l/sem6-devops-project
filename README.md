# ShopSmart DevOps Project

Full-stack e-commerce coursework project with a React storefront, NestJS backend, automated CI, dependency management, test coverage across multiple layers, and GitHub Actions based EC2 deployment.

## Repository Structure

- `client/`: React + Vite frontend
- `server/`: NestJS backend
- `docs/`: architecture, workflow, and deployment explanations
- `scripts/`: idempotent setup, validation, and deployment scripts
- `.github/workflows/`: CI and deployment pipelines

## Implemented Against The Rubric

- Regular engineering workflow support: PR template, contributing guide, and small-scripted quality gates
- GitHub Actions CI on `push` and `pull_request`
- Frontend implementation with reusable components and API-backed catalog/auth flows
- Unit testing with Vitest and Jest
- Integration testing across frontend app flow and backend module boundaries
- E2E testing with Playwright
- PR lint enforcement through CI
- Dependabot configuration
- GitHub Actions to EC2 deployment workflow
- Idempotent automation scripts
- Written explanations for architecture, workflow, design decisions, and deployment

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
npm test --prefix client
npm run lint --prefix server
npm test --prefix server
```

## Test Layers

- Frontend unit tests: `client/src/lib/storefront.unit.test.js` using MSW node handlers
- Frontend integration tests: `client/src/App.integration.test.jsx` using MSW node handlers
- Frontend E2E tests: `client/e2e/storefront.spec.js` using the MSW browser worker
- Backend unit tests: `server/test/unit/categories.service.spec.ts`
- Backend integration tests: `server/test/integration/categories.controller.spec.ts`

## CI/CD

- CI workflow: [`.github/workflows/ci.yml`](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/.github/workflows/ci.yml)
- EC2 deploy workflow: [`.github/workflows/deploy-ec2.yml`](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/.github/workflows/deploy-ec2.yml)
- Dependabot config: [`.github/dependabot.yml`](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/.github/dependabot.yml)

## Documentation

- [Architecture](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/docs/architecture.md)
- [Workflow](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/docs/workflow.md)
- [Deployment](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/docs/deployment.md)
- [Contributing](/Users/yashlunawat/C/sem6/DevOps/sem6-devops-project/CONTRIBUTING.md)

## Notes

- The repository initially had a very short commit history. The new contribution policy and PR template enforce better commit hygiene going forward, but past history cannot be retroactively made “frequent throughout the project” without rewriting repository history.
- The storefront now uses API-first hooks with a safe demo fallback so the UI still works during local frontend-only runs.
