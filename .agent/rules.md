# ShopSmart E-Commerce - Agent Rules

> These rules guide AI agents working on this codebase. Follow these strictly.

## Project Structure

```
sem6-devops-project/
├── client/          # React + Vite frontend (Tailwind CSS)
├── server/          # NestJS backend (TypeORM, PostgreSQL, Redis)
├── .agent/          # AI agent configuration
└── render.yaml      # Deployment configuration
```

## Coding Standards

### TypeScript (Backend)

- **Strict mode enabled** - No implicit `any`, null checks enforced
- Use **path aliases**: `@/`, `@common/`, `@config/`, `@modules/`
- All public API methods must have JSDoc comments
- Use DTOs for all request/response validation
- Follow NestJS module pattern: module, controller, service, entity, dto

### React (Frontend)

- **Functional components only** - No class components
- Use **React hooks** for state and effects
- Component files: PascalCase (`ProductCard.jsx`)
- Co-locate styles, tests, and components when possible
- Use Tailwind CSS utility classes - no inline styles

### Naming Conventions

| Type          | Convention      | Example              |
| ------------- | --------------- | -------------------- |
| Files (TS)    | kebab-case      | `product.service.ts` |
| Files (React) | PascalCase      | `ProductCard.jsx`    |
| Classes       | PascalCase      | `ProductsService`    |
| Functions     | camelCase       | `findAllProducts()`  |
| Constants     | SCREAMING_SNAKE | `MAX_RETRY_COUNT`    |
| DB Tables     | snake_case      | `order_items`        |

## Architectural Rules

### ✅ DO

- Use repository pattern for database access
- Implement DTOs for all API endpoints
- Use guards for authentication/authorization
- Log all errors with context
- Use environment variables for configuration
- Write unit tests for services
- Use TypeORM migrations for schema changes

### ❌ DON'T (Banned Patterns)

- **No direct SQL queries** - Use TypeORM QueryBuilder or repository methods
- **No hardcoded credentials** - Always use environment variables
- **No `any` types** - Use proper typing or `unknown`
- **No console.log in production** - Use NestJS Logger
- **No HTTP calls in services** - Use dedicated integration services
- **No business logic in controllers** - Controllers are thin, services are fat
- **No modifying migration files** after they've been run

## Git & Commits

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

- `feat(products): add product search endpoint`
- `fix(auth): handle expired JWT tokens`
- `chore(deps): update NestJS to v10.3`

### Branch Naming

- `feature/product-search`
- `fix/cart-total-calculation`
- `chore/update-dependencies`

## Linting & Formatting

### Backend (ESLint + Prettier)

```bash
cd server && npm run lint    # Check for issues
cd server && npm run format  # Auto-format
```

Rules enforced:

- No unused variables (error)
- No explicit `any` (warning)
- Prettier formatting (auto-fix)

### Frontend (ESLint)

```bash
cd client && npm run lint
```

Rules enforced:

- React hooks rules
- React refresh compatibility
- JSX best practices

## Security Rules

- Never commit `.env` files
- Use `bcrypt` for password hashing (rounds: 12)
- Validate all user inputs with `class-validator`
- Use rate limiting on all public endpoints
- Enable CORS only for allowed origins
- Use Helmet for security headers

## Performance Guidelines

- Use Redis for caching frequently accessed data
- Paginate all list endpoints (default: 20 items)
- Use database indexes for queried columns
- Lazy load frontend routes and components
- Optimize images before serving

## Testing Requirements

- All services should have unit tests (>70% coverage)
- E2E tests for critical user flows (auth, checkout)
- Run tests before committing: `npm test`
- Never commit failing tests

## API Design

- RESTful conventions: `GET /products`, `POST /orders`
- Use plural nouns for resources
- Version the API: `/api/v1/`
- Return proper HTTP status codes
- Include pagination metadata in list responses
