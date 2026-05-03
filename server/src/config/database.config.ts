import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const databaseSsl =
    String(configService.get<string>('DATABASE_SSL', 'false')).toLowerCase() === 'true';
  const databaseSynchronize =
    String(configService.get<string>('DATABASE_SYNCHRONIZE', 'false')).toLowerCase() === 'true';

  return {
    type: 'postgres',

    // Connection details
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),

    // RDS often requires TLS (`no encryption` in pg_hba is rejected).
    ssl: databaseSsl ? { rejectUnauthorized: false } : false,

    // Entity loading
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],

    // Lab/EKS: set DATABASE_SYNCHRONIZE=true so RDS gets schema (no migration files in repo yet).
    // Real production should use migrations and set this false.
    synchronize: databaseSynchronize,

    migrationsRun: false,

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

    // Optional Redis cache only when a real host is set (not empty / localhost — K8s has no Redis on loopback).
    cache: (() => {
      const host = (configService.get<string>('REDIS_HOST') ?? '').trim();
      if (!host || host === 'localhost' || host === '127.0.0.1') {
        return false;
      }
      return {
        type: 'redis' as const,
        options: {
          host,
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
        duration: 30000,
      };
    })(),
  };
};
