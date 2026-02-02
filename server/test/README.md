# Server Tests

This directory contains tests for the e-commerce backend API.

## Test Structure

```
server/
├── test/
│   ├── e2e/                  # End-to-end API tests
│   │   ├── app.e2e-spec.ts   # Application health tests
│   │   └── ...               # Other E2E tests
│   └── jest-e2e.json         # E2E Jest configuration
├── tests/
│   └── app.test.js           # Basic app tests
└── src/
    └── **/*.spec.ts          # Unit tests (co-located)
```

## Running Tests

### All Unit Tests

```bash
npm test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Specific Test File

```bash
npm test -- --testPathPattern=products.service.spec.ts
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:cov
```

## Writing Tests

### Unit Test Example

```typescript
// src/modules/products/products.service.spec.ts
import { Test } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
// test/e2e/products.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer()).get('/api/v1/products').expect(200);
  });
});
```

## Coverage Requirements

- Minimum 70% statement coverage
- Minimum 60% branch coverage
- Focus on service layer testing
- All critical paths must be tested

## Mocking Guidelines

- Use `@nestjs/testing` Test utilities
- Mock repositories, not services
- Use `jest.spyOn()` for partial mocking
- Create factory functions for mock data
