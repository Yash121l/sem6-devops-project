import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  return {
    type: 'postgres',

    // Connection details
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),

    // SSL configuration
    ssl: configService.get<boolean>('DATABASE_SSL') ? { rejectUnauthorized: false } : false,

    // Entity loading
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

    // CRITICAL: Never synchronize in production - use migrations
    synchronize: false,

    // Auto-run migrations on startup in production
    migrationsRun: isProduction,

    // Auto-load entities from modules
    autoLoadEntities: true,

    // Logging configuration
    logging: configService.get<boolean>('DATABASE_LOGGING')
      ? ['query', 'error', 'warn', 'migration']
      : ['error', 'warn', 'migration'],

    // Connection pool settings for production scalability
    extra: {
      // Maximum clients in pool
      max: configService.get<number>('DATABASE_POOL_SIZE', 20),
      // Minimum clients in pool
      min: configService.get<number>('DATABASE_POOL_MIN', 5),
      // Connection timeout (10 seconds)
      connectionTimeoutMillis: 10000,
      // Idle timeout (30 seconds)
      idleTimeoutMillis: 30000,
      // Statement timeout (30 seconds) - prevents long-running queries
      statement_timeout: 30000,
    },

    // Retry logic for transient connection failures
    retryAttempts: isProduction ? 10 : 3,
    retryDelay: 3000,

    // Optional Redis cache for read-heavy workloads
    cache: configService.get<string>('REDIS_HOST')
      ? {
          type: 'redis',
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          },
          duration: 30000,
        }
      : false,
  };
};
