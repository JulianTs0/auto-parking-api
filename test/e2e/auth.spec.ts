import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth (E2E)', () => {
    let app: INestApplication;
    let httpServer: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule =
            await Test.createTestingModule({
                imports: [AppModule],
            }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/login', () => {
        it('should return 401 for invalid credentials', async () => {
            const response = await supertest(httpServer)
                .post('/auth/login')
                .send({
                    email: 'invalid@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
        });
    });

    describe('POST /auth/register', () => {
        it('should return 201 for valid registration', async () => {
            const response = await supertest(httpServer)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test',
                    lastName: 'User',
                    phone: '+1234567890',
                });

            expect(response.status).toBe(201);
        });
    });
});
