import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { Errors, Role } from 'src/commons';
import { createCreateUserDtoFixture } from '../../test/fixtures/auth.fixtures';
import { TestDatabaseHelper } from '../../test/utils/test-database.helper';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';

describe('Auth Mobile Module (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let dbHelper: TestDatabaseHelper;

    beforeAll(async () => {
        const moduleFixture: TestingModule =
            await Test.createTestingModule({
                imports: [AppModule],
                providers: [TestDatabaseHelper],
            }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();

        dataSource = app.get(DataSource);
        dbHelper = app.get(TestDatabaseHelper);
    });

    afterAll(async () => {
        await dbHelper.closeConnection();
        await app.close();
    });

    beforeEach(async () => {
        await dbHelper.cleanDatabase();
    });

    describe('Success Cases', () => {
        it('POST /mobile/auth/register - Should register user successfully (201)', async () => {
            // Arrange
            const registerDto = createCreateUserDtoFixture({
                email: 'mobile_e2e@test.com',
                fullName: 'Mobile Tester',
                phoneNumber: '+5491188887777',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/mobile/auth/register')
                .send(registerDto);

            // Assert - should return 201
            expect(response.status).toBe(201);

            // Assert - verify user in database
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ email: 'mobile_e2e@test.com' });
            expect(dbUser).toBeDefined();
            expect(dbUser?.roles).toContain(Role.CLIENT);
            expect(dbUser?.fullName).toBe('Mobile Tester');
        });
    });

    describe('DTO Validation (Bad Request Cases)', () => {
        it('POST /mobile/auth/register - Should fail if email is invalid (400)', async () => {
            // Arrange
            const invalidDto = createCreateUserDtoFixture({
                email: 'no-es-un-email',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/mobile/auth/register')
                .send(invalidDto);

            // Assert
            expect(response.status).toBe(
                Errors.INVALID_FIELDS.status,
            );
            expect(response.body.status).toBe(
                Errors.INVALID_FIELDS.status,
            );
            expect(response.body.message).toContain(
                Errors.INVALID_FIELDS.message,
            );
        });

        it('POST /mobile/auth/register - Should fail if password does not meet security requirements (400)', async () => {
            // Arrange
            const weakPasswordDto = createCreateUserDtoFixture({
                password: '123',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/mobile/auth/register')
                .send(weakPasswordDto);

            // Assert
            expect(response.status).toBe(
                Errors.INVALID_FIELDS.status,
            );
            expect(response.body.status).toBe(
                Errors.INVALID_FIELDS.status,
            );
            expect(response.body.message).toContain(
                Errors.INVALID_FIELDS.message,
            );
        });
    });
});
