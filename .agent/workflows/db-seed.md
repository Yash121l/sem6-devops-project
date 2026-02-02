---
description: Seed database with sample data
---

# Seed Database

Populate the database with sample/test data.

## Prerequisites

Ensure PostgreSQL is running and migrations are applied.

// turbo

1. Check database connection

```bash
cd server && docker-compose ps postgres
```

// turbo 2. Run any pending migrations

```bash
cd server && npm run migration:run
```

// turbo 3. Execute seed script

```bash
cd server && npm run seed:run
```

4. Verify seeded data by checking the API:

```bash
curl http://localhost:3000/api/v1/health
```

## Reset and Reseed (Development Only)

⚠️ **WARNING: This will delete all existing data**

5. Drop schema

```bash
cd server && npm run schema:drop
```

6. Re-run migrations

```bash
cd server && npm run migration:run
```

7. Re-seed database

```bash
cd server && npm run seed:run
```
