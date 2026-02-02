---
name: testing
description: Test execution guidelines for backend and frontend
---

# Testing Skill

This skill provides comprehensive testing guidelines for the e-commerce application.

## Quick Reference

| Test Type         | Command                         | Location                       |
| ----------------- | ------------------------------- | ------------------------------ |
| Server Unit Tests | `cd server && npm test`         | `server/src/**/*.spec.ts`      |
| Server E2E Tests  | `cd server && npm run test:e2e` | `server/test/e2e/`             |
| Server Coverage   | `cd server && npm run test:cov` | Coverage in `server/coverage/` |
| Client Tests      | `cd client && npm test`         | `client/src/**/*.test.jsx`     |

## Backend Testing (NestJS + Jest)

### Run All Tests

// turbo

```bash
cd server && npm test
```

### Run with Watch Mode

```bash
cd server && npm run test:watch
```

### Run Specific Test File

```bash
cd server && npm test -- --testPathPattern=products.service.spec.ts
```

### Run E2E Tests

// turbo

```bash
cd server && npm run test:e2e
```

### Generate Coverage Report

// turbo

```bash
cd server && npm run test:cov
```

### Test File Naming Convention

- Unit tests: `*.spec.ts` (co-located with source files)
- E2E tests: `*.e2e-spec.ts` (in `test/e2e/` directory)

### Test Structure

```typescript
describe("ProductsService", () => {
  let service: ProductsService;
  let repository: MockType<Repository<Product>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(getRepositoryToken(Product));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return array of products", async () => {
      const result = [{ id: "1", name: "Product 1" }];
      repository.find.mockReturnValue(result);
      expect(await service.findAll()).toEqual(result);
    });
  });
});
```

## Frontend Testing (React + Vitest)

### Run All Tests

// turbo

```bash
cd client && npm test
```

### Run with UI

```bash
cd client && npx vitest --ui
```

### Run Single Test File

```bash
cd client && npm test -- App.test.jsx
```

### Test File Naming Convention

- Component tests: `*.test.jsx` (co-located with components)

### Test Structure

```jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProductCard from "./ProductCard";

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard name="Test Product" price={99.99} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("displays formatted price", () => {
    render(<ProductCard name="Test" price={99.99} />);
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });
});
```

## Coverage Requirements

| Metric     | Minimum Threshold |
| ---------- | ----------------- |
| Statements | 70%               |
| Branches   | 60%               |
| Functions  | 70%               |
| Lines      | 70%               |

## Pre-Commit Testing

Before committing, always run:
// turbo-all

```bash
cd server && npm test
cd client && npm test
cd server && npm run lint
cd client && npm run lint
```

## Debugging Tests

### Server Tests (VSCode)

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/server/node_modules/.bin/jest",
  "args": ["--runInBand", "--watchAll=false"],
  "cwd": "${workspaceFolder}/server",
  "console": "integratedTerminal"
}
```

### Client Tests (VSCode)

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "program": "${workspaceFolder}/client/node_modules/vitest/vitest.mjs",
  "args": ["--no-file-parallelism"],
  "cwd": "${workspaceFolder}/client",
  "console": "integratedTerminal"
}
```

## Mocking Guidelines

### Backend Mocking

- Use `@nestjs/testing` for module mocking
- Mock repositories, not services (when testing services)
- Use `jest.spyOn()` for partial mocks

### Frontend Mocking

- Use `vi.mock()` for module mocks
- Use `@testing-library/react` for component testing
- Mock context providers when needed
