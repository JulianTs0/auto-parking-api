import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Users (E2E)', () => {
    let app: INestApplication;
    let httpServer: any;
    const authToken = '';

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

    describe('GET /users', () => {
        it('should return 401 without auth token', async () => {
            const response =
                await supertest(httpServer).get('/users');

            expect(response.status).toBe(401);
        });

        it('should return 200 with valid auth token', async () => {
            const response = await supertest(httpServer)
                .get('/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('GET /users/:id', () => {
        it('should return 404 for non-existent user', async () => {
            const response = await supertest(httpServer)
                .get('/users/550e8400-e29b-41d4-a716-446655440999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
});
