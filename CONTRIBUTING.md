# Contributing

## Commit discipline

- Keep commits small, logical, and reviewable.
- Do not batch unrelated frontend, backend, and infrastructure changes into one commit.
- Prefer conventional commit prefixes such as `feat:`, `fix:`, `test:`, `docs:`, and `ci:`.
- Open pull requests only after local lint and tests pass.

## Required checks

- `npm run lint --prefix client`
- `npm test --prefix client`
- `npm run lint --prefix server`
- `npm test --prefix server`

## Branching

- Use short-lived feature branches.
- Rebase or merge from `main` frequently to avoid large end-of-cycle integration work.

