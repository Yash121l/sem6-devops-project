import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import { validationSchema } from '@config/validation.schema';
import { getDatabaseConfig } from '@config/database.config';

// Feature modules
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { ProductsModule } from '@modules/products/products.module';
import { InventoryModule } from '@modules/inventory/inventory.module';
import { CartModule } from '@modules/cart/cart.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { CouponsModule } from '@modules/coupons/coupons.module';
import { AuditModule } from '@modules/audit/audit.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema,
            validationOptions: {
                abortEarly: true,
            },
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getDatabaseConfig,
        }),

        // Rate limiting
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                throttlers: [
                    {
                        name: 'default',
                        ttl: configService.get<number>('RATE_LIMIT_TTL', 60) * 1000,
                        limit: configService.get<number>('RATE_LIMIT_MAX', 100),
                    },
                ],
            }),
        }),

        // Feature modules
        AuthModule,
        UsersModule,
        CategoriesModule,
        ProductsModule,
        InventoryModule,
        CartModule,
        OrdersModule,
        PaymentsModule,
        CouponsModule,
        AuditModule,
        HealthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
