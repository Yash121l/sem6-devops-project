---
description: Run full test suite for client and server
---

# Run Full Test Suite

Execute all tests across the project.

// turbo

1. Run backend unit tests

```bash
cd server && npm test
```

// turbo 2. Run backend E2E tests

```bash
cd server && npm run test:e2e
```

// turbo 3. Run frontend tests

```bash
cd client && npm test
```

// turbo 4. Generate backend coverage report

```bash
cd server && npm run test:cov
```

5. View coverage summary

```bash
cat server/coverage/coverage-summary.json | head -20
```
