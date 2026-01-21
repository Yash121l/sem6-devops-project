# Enterprise E-Commerce Backend

A **production-ready, enterprise-grade e-commerce backend** built with **NestJS (TypeScript)** and modern industry best practices.

## 🚀 Features

### Core Business Domains
- **Authentication & Authorization**
  - JWT access tokens (15-minute expiry)
  - Refresh token rotation (7-day expiry)
  - Token family tracking for security
  - Role-based access control (RBAC)
  - Policy-based authorization (ABAC)

- **Users Management**
  - User registration and profile management
  - Password hashing with bcrypt (12 rounds)
  - Email verification support
  - Role assignment (Super Admin, Admin, Manager, Customer)

- **Products & Categories**
  - Hierarchical category structure
  - Product variants with SKU management
  - Search and filtering
  - SEO metadata support

- **Inventory Management**
  - Real-time stock tracking
  - Inventory reservations
  - Low stock alerts
  - Backorder support

- **Shopping Cart**
  - Guest and authenticated cart
  - Cart to user migration
  - Coupon application
  - Automatic price calculation

- **Orders & Lifecycle**
  - Order creation from cart
  - Status transitions with validation
  - Order history and tracking
  - Cancellation with inventory release

- **Payments**
  - Payment initiation and processing
  - Refund handling
  - Webhook support (Stripe/PayPal ready)

- **Coupons & Discounts**
  - Percentage and fixed discounts
  - Usage limits and date validity
  - Minimum purchase requirements

- **Audit Logging**
  - Sensitive operation tracking
  - User action logging
  - Request ID correlation

- **Health Checks**
  - Database connectivity
  - Memory and disk monitoring
  - Kubernetes-ready probes

### Technical Features
- ✅ Clean architecture with separation of concerns
- ✅ Consistent API response format
- ✅ Centralized error handling
- ✅ Request/response logging with correlation IDs
- ✅ Rate limiting
- ✅ Input validation
- ✅ Swagger/OpenAPI documentation
- ✅ Docker support
- ✅ Database migrations
- ✅ Seed data

## 🛠 Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS 10.x |
| Language | TypeScript 5.x |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Cache/Sessions | Redis 7 |
| Authentication | JWT + Passport |
| Validation | class-validator |
| Documentation | Swagger/OpenAPI |
| Testing | Jest |
| Containerization | Docker |

## 📁 Project Structure

```
server/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── common/                 # Shared utilities
│   │   ├── constants/          # Application constants
│   │   ├── decorators/         # Custom decorators
│   │   ├── dto/                # Shared DTOs
│   │   ├── entities/           # Base entities
│   │   ├── enums/              # Shared enums
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Request/response interceptors
│   │   └── utils/              # Utility functions
│   ├── config/                 # Configuration modules
│   ├── database/               # Database setup
│   │   ├── migrations/         # TypeORM migrations
│   │   └── seeds/              # Seed data
│   └── modules/                # Feature modules
│       ├── auth/               # Authentication
│       ├── users/              # User management
│       ├── categories/         # Product categories
│       ├── products/           # Products
│       ├── inventory/          # Inventory management
│       ├── cart/               # Shopping cart
│       ├── orders/             # Order management
│       ├── payments/           # Payment processing
│       ├── coupons/            # Coupons & discounts
│       ├── audit/              # Audit logging
│       └── health/             # Health checks
├── test/                       # Tests
├── docker/                     # Docker configuration
└── docker-compose.yml          # Local development
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 16 (or use Docker)

### Local Development

1. **Clone and install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Start infrastructure with Docker**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run database seed**
   ```bash
   npm run seed:run
   ```

5. **Start development server**
   ```bash
   npm run start:dev
   ```

6. **Access the application**
   - API: http://localhost:3000/api/v1
   - Swagger: http://localhost:3000/api/docs
   - Health: http://localhost:3000/api/v1/health

### Using Docker Compose (Full Stack)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis cache
- Application server

## 📚 API Documentation

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Endpoints Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout` |
| Users | `GET /users/me`, `PUT /users/me`, `PUT /users/me/password` |
| Categories | `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id` |
| Products | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id` |
| Inventory | `GET /inventory`, `PUT /inventory/:variantId`, `POST /inventory/:variantId/adjust` |
| Cart | `GET /cart`, `POST /cart/items`, `PUT /cart/items/:id`, `DELETE /cart/items/:id` |
| Orders | `GET /orders`, `POST /orders`, `PUT /orders/:id/status`, `POST /orders/:id/cancel` |
| Payments | `POST /payments`, `POST /payments/:id/process`, `POST /payments/:id/refund` |
| Coupons | `GET /coupons`, `POST /coupons`, `POST /coupons/validate` |
| Health | `GET /health`, `GET /health/liveness`, `GET /health/readiness` |

### Response Format

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "path": "/api/v1/auth/login",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Security

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: Short-lived access tokens (15 min)
- **Refresh Token Rotation**: New token issued on each refresh
- **Token Family Tracking**: Detects token reuse attacks
- **Rate Limiting**: 100 requests/minute (configurable)
- **Input Validation**: Whitelist-based validation with strict type checking
- **Security Headers**: Helmet middleware enabled
- **CORS**: Configurable origin restrictions

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:cov
```

## 📦 Database

### Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Seed Data

```bash
npm run seed:run
```

**Default Users:**
| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | Password123! | Super Admin |
| admin@example.com | Password123! | Admin |
| manager@example.com | Password123! | Manager |
| customer@example.com | Password123! | Customer |

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production Build
```bash
docker build -f docker/Dockerfile -t ecommerce-api .
```

## 🔧 Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `DATABASE_HOST` | PostgreSQL host | localhost |
| `DATABASE_PORT` | PostgreSQL port | 5432 |
| `DATABASE_NAME` | Database name | ecommerce |
| `DATABASE_USER` | Database user | postgres |
| `DATABASE_PASSWORD` | Database password | postgres |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_ACCESS_EXPIRATION` | Access token TTL | 15m |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `RATE_LIMIT_TTL` | Rate limit window (seconds) | 60 |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |

## 📈 Monitoring

### Health Checks
- `GET /api/v1/health` - Full health status
- `GET /api/v1/health/liveness` - Basic liveness probe
- `GET /api/v1/health/readiness` - Database connectivity check

### Logging
- Structured JSON logging
- Request/response logging with correlation IDs
- Error logging with stack traces (development only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

---

Built with ❤️ using NestJS
