import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';

describe('OwnerRequests (E2E)', () => {
    let app: INestApplication;
    let httpServer: any;
    let authToken = '';

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

    describe('POST /web/owner-requests', () => {
        it('should return 201 for valid request', async () => {
            const response = await supertest(httpServer)
                .post('/web/owner-requests')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(201);
        });
    });

    describe('GET /web/owner-requests', () => {
        it('should return 401 without auth token', async () => {
            const response = await supertest(httpServer).get(
                '/web/owner-requests',
            );

            expect(response.status).toBe(401);
        });

        it('should return 200 with valid auth token', async () => {
            const response = await supertest(httpServer)
                .get('/web/owner-requests')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('GET /web/owner-requests/:id', () => {
        it('should return 404 for non-existent request', async () => {
            const response = await supertest(httpServer)
                .get(
                    '/web/owner-requests/550e8400-e29b-41d4-a716-446655440999',
                )
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /web/owner-requests/:id/approve', () => {
        it('should return 200 for valid approval', async () => {
            const response = await supertest(httpServer)
                .patch(
                    '/web/owner-requests/550e8400-e29b-41d4-a716-446655440000/approve',
                )
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('PATCH /web/owner-requests/:id/reject', () => {
        it('should return 200 for valid rejection', async () => {
            const response = await supertest(httpServer)
                .patch(
                    '/web/owner-requests/550e8400-e29b-41d4-a716-446655440000/reject',
                )
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
        });
    });
});
