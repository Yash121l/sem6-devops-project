import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products & Cart (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let productId: string;
    let variantId: string;
    let cartItemId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        app.setGlobalPrefix('api/v1');
        await app.init();

        // Login to get access token
        const loginRes = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'customer@example.com',
                password: 'Password123!',
            });

        accessToken = loginRes.body.data.accessToken;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/v1/products (GET)', () => {
        it('should return products list', () => {
            return request(app.getHttpServer())
                .get('/api/v1/products')
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(Array.isArray(res.body.data)).toBe(true);
                    if (res.body.data.length > 0) {
                        productId = res.body.data[0].id;
                        variantId = res.body.data[0].variants?.[0]?.id;
                    }
                });
        });

        it('should filter by category', () => {
            return request(app.getHttpServer())
                .get('/api/v1/products?search=headphones')
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                });
        });
    });

    describe('/api/v1/categories (GET)', () => {
        it('should return categories list', () => {
            return request(app.getHttpServer())
                .get('/api/v1/categories')
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(Array.isArray(res.body.data)).toBe(true);
                });
        });

        it('should return category tree', () => {
            return request(app.getHttpServer())
                .get('/api/v1/categories/tree')
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                });
        });
    });

    describe('Cart operations', () => {
        it('should get empty cart', () => {
            return request(app.getHttpServer())
                .get('/api/v1/cart')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                });
        });

        it('should add item to cart', async () => {
            // Skip if no products available
            if (!productId || !variantId) {
                console.log('Skipping cart test - no products available');
                return;
            }

            return request(app.getHttpServer())
                .post('/api/v1/cart/items')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    productId,
                    variantId,
                    quantity: 1,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    if (res.body.data.items?.length > 0) {
                        cartItemId = res.body.data.items[0].id;
                    }
                });
        });

        it('should update cart item quantity', async () => {
            if (!cartItemId) {
                console.log('Skipping update test - no cart item');
                return;
            }

            return request(app.getHttpServer())
                .put(`/api/v1/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ quantity: 2 })
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                });
        });

        it('should remove item from cart', async () => {
            if (!cartItemId) {
                console.log('Skipping remove test - no cart item');
                return;
            }

            return request(app.getHttpServer())
                .delete(`/api/v1/cart/items/${cartItemId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
        });
    });
});
