# Development Workflow

## Local setup

1. Run `./scripts/bootstrap.sh`.
2. Start the frontend with `npm run dev --prefix client`.
3. Start the backend with `npm run start:dev --prefix server`.

## Validation loop

Use `./scripts/checks.sh` before pushing changes. The script is idempotent and can be run repeatedly.

Local git safety net:

- Husky runs `.husky/pre-commit`
- `lint-staged` formats and lints only staged files before a commit is created

Frontend tests do not require a running backend. API calls are mocked through MSW:

- Vitest uses `msw/node`
- Playwright uses the browser service worker started through `VITE_ENABLE_MSW=true`

## Pull requests

- The [rubric pipeline workflow](../.github/workflows/rubric-pipeline.yml) runs on `push` and `pull_request` (and `workflow_dispatch`).
- The PR template requires validation commands and a brief explanation of the change.
- Lint failures block the pipeline.

## Commit strategy

- Commit each logical change separately.
- Prefer sequencing like `ci`, `frontend`, `server`, `tests`, `docs`.
- Avoid bulk commits at the end of the project.
