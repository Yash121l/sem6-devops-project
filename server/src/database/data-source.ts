import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'ecommerce',

  // SSL configuration for production
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Entity and migration paths
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],

  // NEVER use synchronize in production - always use migrations
  synchronize: false,

  // Auto-run migrations on application startup
  migrationsRun: isProduction,

  // Logging configuration
  logging:
    process.env.DATABASE_LOGGING === 'true'
      ? ['query', 'error', 'warn', 'migration']
      : ['error', 'warn', 'migration'],

  // Connection pool configuration for production
  extra: {
    // Maximum number of clients in the pool
    max: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
    // Minimum number of clients in the pool
    min: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
    // Connection timeout in milliseconds
    connectionTimeoutMillis: 10000,
    // Idle timeout in milliseconds
    idleTimeoutMillis: 30000,
    // Statement timeout in milliseconds (30 seconds)
    statement_timeout: 30000,
  },

  // Cache configuration (optional - enable for read-heavy workloads)
  cache: process.env.REDIS_HOST
    ? {
        type: 'redis' as const,
        options: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
        },
        duration: 30000, // Cache duration in milliseconds
      }
    : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
