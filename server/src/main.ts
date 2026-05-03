import { join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  const publicDir = join(__dirname, '..', 'public');
  const serveStorefront =
    configService.get<string>('NODE_ENV') === 'production' &&
    existsSync(join(publicDir, 'index.html'));

  if (serveStorefront) {
    // Register before other middleware so `/` and `/assets/*` are served; `/api/*` falls through to Nest.
    app.use(express.static(publicDir));
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
        return;
      }
      if (
        req.path.startsWith('/api') ||
        req.path === '/sitemap.xml' ||
        req.path === '/robots.txt'
      ) {
        next();
        return;
      }
      res.sendFile(join(publicDir, 'index.html'), next);
    });
    logger.log(`Storefront static files from ${publicDir}`);
  }

  // Security middleware (needs `esModuleInterop` in tsconfig so CJS `compression` emits a callable default in dist).
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3001'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // API versioning
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const apiVersion = configService.get<string>('API_VERSION', 'v1');

  // Version is already in the path (`api` + `v1`). Do not enable URI versioning here: with
  // `defaultVersion` and no `@Version()` on controllers, Nest still prefixes routes (e.g.
  // `/api/v1/1/health/...`) so K8s probes on `/api/v1/health/...` return 404.
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`, {
    exclude: [
      { path: 'sitemap.xml', method: RequestMethod.GET },
      { path: 'robots.txt', method: RequestMethod.GET },
    ],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor(reflector));

  // Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('E-Commerce API')
      .setDescription('Enterprise-grade e-commerce backend API documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('categories', 'Category management endpoints')
      .addTag('products', 'Product management endpoints')
      .addTag('inventory', 'Inventory management endpoints')
      .addTag('cart', 'Shopping cart endpoints')
      .addTag('orders', 'Order management endpoints')
      .addTag('payments', 'Payment processing endpoints')
      .addTag('coupons', 'Coupon management endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log(`Swagger documentation available at /${apiPrefix}/docs`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`Application running on port ${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')}`);
}

bootstrap();
