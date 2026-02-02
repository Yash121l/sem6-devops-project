---
name: database
description: Database operations including migrations, seeding, and maintenance
---

# Database Skill

This skill provides instructions for managing the PostgreSQL database and TypeORM migrations.

## Quick Reference

| Operation              | Command                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| Run migrations         | `npm run migration:run`                                               |
| Revert last migration  | `npm run migration:revert`                                            |
| Generate migration     | `npm run migration:generate -- src/database/migrations/MigrationName` |
| Create empty migration | `npm run migration:create -- src/database/migrations/MigrationName`   |
| Sync schema (dev only) | `npm run schema:sync`                                                 |
| Drop schema (DANGER)   | `npm run schema:drop`                                                 |
| Seed database          | `npm run seed:run`                                                    |

## Starting Database (Development)

// turbo

1. Start PostgreSQL and Redis via Docker Compose

```bash
cd server && docker-compose up -d postgres redis
```

// turbo 2. Verify databases are running

```bash
docker ps | grep -E "postgres|redis"
```

## Migrations

### Run Pending Migrations

// turbo

```bash
cd server && npm run migration:run
```

### Generate Migration from Entity Changes

When you modify entities, generate a migration:

```bash
cd server && npm run migration:generate -- src/database/migrations/AddProductDescription
```

### Revert Last Migration

// turbo

```bash
cd server && npm run migration:revert
```

### Show Migration Status

// turbo

```bash
cd server && npm run migration:show
```

## Seeding Data

### Run Seeds

// turbo

```bash
cd server && npm run seed:run
```

The seed script is located at `server/src/database/seeds/run-seed.ts`.

### Seed Data Types

Seeds typically include:

- Admin user account
- Product categories
- Sample products
- Test coupon codes

## Backup & Restore

### Backup Database (Production)

```bash
# Using pg_dump
pg_dump -h HOST -U USER -d DATABASE -F c -f backup_$(date +%Y%m%d).dump
```

### Restore Database

```bash
# Using pg_restore
pg_restore -h HOST -U USER -d DATABASE -c backup_YYYYMMDD.dump
```

## Troubleshooting

### Connection Issues

Check environment variables in `.env`:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ecommerce
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```

### Migration Conflicts

If migrations are out of sync:

1. Check `typeorm_migrations` table in database
2. Ensure all team members have same migration files
3. Never modify already-run migrations

### Reset Database (Development Only)

⚠️ **DANGER: This will delete all data**

```bash
cd server && npm run schema:drop
cd server && npm run migration:run
cd server && npm run seed:run
```

## Redis Operations

### Connect to Redis CLI

```bash
docker exec -it ecommerce-redis redis-cli
```

### Clear Redis Cache

```bash
docker exec -it ecommerce-redis redis-cli FLUSHALL
```
