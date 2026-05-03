import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),

  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  // K8s / shell env vars are strings; accept explicit true/false for RDS TLS.
  DATABASE_SSL: Joi.string().valid('true', 'false').default('false'),
  DATABASE_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),
  RUN_DB_SEED: Joi.string().valid('true', 'false').default('false'),
  DATABASE_LOGGING: Joi.boolean().default(false),

  // Redis (empty = no TypeORM Redis cache; use a hostname in Docker Compose, e.g. `redis`)
  REDIS_HOST: Joi.string().allow('').default(''),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),

  // JWT
  JWT_SECRET: Joi.string().required().min(32),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(12),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'log', 'debug', 'verbose').default('log'),

  // Cart / checkout totals (server authority; env vars are strings — parsed in checkout-pricing.config)
  CART_TAX_RATE: Joi.string().default('0.08'),
  CART_FREE_SHIPPING_THRESHOLD: Joi.string().default('75'),
  CART_FLAT_SHIPPING: Joi.string().default('9.99'),
});
