import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let refreshToken: string;

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
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/v1/auth/register (POST)', () => {
        it('should register a new user', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: `test-${Date.now()}@example.com`,
                    password: 'Password123!',
                    firstName: 'Test',
                    lastName: 'User',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(res.body.data.accessToken).toBeDefined();
                    expect(res.body.data.refreshToken).toBeDefined();
                });
        });

        it('should reject invalid email', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Password123!',
                    firstName: 'Test',
                    lastName: 'User',
                })
                .expect(400);
        });

        it('should reject weak password', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'weak',
                    firstName: 'Test',
                    lastName: 'User',
                })
                .expect(400);
        });
    });

    describe('/api/v1/auth/login (POST)', () => {
        it('should login with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'customer@example.com',
                    password: 'Password123!',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(res.body.data.accessToken).toBeDefined();
                    expect(res.body.data.refreshToken).toBeDefined();
                    accessToken = res.body.data.accessToken;
                    refreshToken = res.body.data.refreshToken;
                });
        });

        it('should reject invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'customer@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);
        });
    });

    describe('/api/v1/auth/refresh (POST)', () => {
        it('should refresh tokens', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/refresh')
                .send({ refreshToken })
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(res.body.data.accessToken).toBeDefined();
                });
        });

        it('should reject invalid refresh token', () => {
            return request(app.getHttpServer())
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: 'invalid-token' })
                .expect(401);
        });
    });

    describe('/api/v1/users/me (GET)', () => {
        it('should return current user profile', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(res.body.data.email).toBeDefined();
                });
        });

        it('should reject unauthenticated request', () => {
            return request(app.getHttpServer())
                .get('/api/v1/users/me')
                .expect(401);
        });
    });
});
