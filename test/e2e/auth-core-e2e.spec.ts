import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { UserStatus, User, IdGenerator } from 'src/commons';
import {
    createLoginReqFixture,
    createVerifyEmailReqFixture,
    createEditPasswordBodyFixture,
    createUserFixture,
} from '../../test/fixtures';
import { TestDatabaseHelper } from '../../test/utils/test-database.helper';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { seedUser } from '../../test/utils/integration-module.utils';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';

describe('Auth Core Module (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let dbHelper: TestDatabaseHelper;
    let authHelper: AuthHelper;

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
        authHelper = app.get(AuthHelper);
    });

    afterAll(async () => {
        await dbHelper.closeConnection();
        await app.close();
    });

    beforeEach(async () => {
        await dbHelper.cleanDatabase();
    });

    const getUserRepository = () =>
        dataSource.getRepository(UserModel);

    const setupUser = async (overrides = {}) => {
        const id = IdGenerator.generateUUID();
        const userData = createUserFixture({
            email: `auth_${id}@test.com`,
            ...overrides,
            id,
        });

        const model = UserEntityMapper.toModel(userData as any);
        await dataSource.getRepository(UserModel).save(model!);

        const token = await authHelper.createToken(
            Object.assign(new User(), userData),
        );

        return { user: userData, token: token.accessToken };
    };

    describe('Success Cases', () => {
        it('POST /auth/login - Should login and return a token (201)', async () => {
            // Arrange
            const password = 'Password123!';
            const hash = await authHelper.hashPassword(password);
            await seedUser(getUserRepository(), {
                id: IdGenerator.generateUUID(),
                email: 'login@test.com',
                passwordHash: hash,
                status: UserStatus.ACTIVE,
            });

            const loginReq = createLoginReqFixture({
                email: 'login@test.com',
                password,
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginReq);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - token should be defined
            expect(response.body.token.accessToken).toBeDefined();
        });

        it('POST /auth/verify - Should activate user via token (201)', async () => {
            // Arrange
            const { user, token } = await setupUser({
                status: UserStatus.INACTIVE,
            });
            const verifyReq = createVerifyEmailReqFixture({ token });

            // Act
            const response = await request(app.getHttpServer())
                .post('/auth/verify')
                .send(verifyReq);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - user status should be ACTIVE in database
            const dbUser = await getUserRepository().findOneBy({
                id: user.id,
            });
            expect(dbUser?.status).toBe(UserStatus.ACTIVE);
        });

        it('GET /auth - Should get authenticated user profile (200)', async () => {
            // Arrange
            const { user, token } = await setupUser({
                fullName: 'John Authenticated',
            });

            // Act
            const response = await request(app.getHttpServer())
                .get('/auth')
                .set('Authorization', `Bearer ${token}`);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - should have correct fullName
            expect(response.body.fullName).toBe('John Authenticated');
            // Assert - should have correct email
            expect(response.body.email).toBe(user.email);
        });

        it('PATCH /auth/password - Should update user password (200)', async () => {
            // Arrange
            const { user, token } = await setupUser();
            const newPassword = 'NewSecurePassword123!';
            const editPwdBody = createEditPasswordBodyFixture({
                newPassword,
            });

            // Act
            const response = await request(app.getHttpServer())
                .patch('/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send(editPwdBody);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - password should be updated in database
            const dbUser = await getUserRepository().findOneBy({
                id: user.id,
            });
            const isMatch = await authHelper.validatePassword(
                Object.assign(new User(), {
                    passwordHash: dbUser?.passwordHash,
                }),
                newPassword,
            );
            expect(isMatch).toBe(true);
        });
    });

    describe('Repository and DAO Logic (State Filters)', () => {
        it('POST /auth/login - Should reject access if user is BANNED (404)', async () => {
            // Arrange
            const password = 'Password123!';
            const hash = await authHelper.hashPassword(password);
            await seedUser(getUserRepository(), {
                id: IdGenerator.generateUUID(),
                email: 'banned@test.com',
                passwordHash: hash,
                status: UserStatus.BANNED,
            });

            const loginReq = createLoginReqFixture({
                email: 'banned@test.com',
                password,
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginReq);

            // Assert - should return 404
            expect(response.status).toBe(404);

            // Assert - error message should be "User not found"
            expect(response.body.message).toBe('User not found');
        });

        it('GET /auth - Should fail if user is DELETED (404/401)', async () => {
            // Arrange
            const { token } = await setupUser({
                status: UserStatus.DELETED,
            });

            // Act & Assert - should return 404
            await request(app.getHttpServer())
                .get('/auth')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    describe('DTO Validation and Security', () => {
        it('POST /auth/login - Should fail with 400 if email is invalid', async () => {
            // Arrange
            const invalidLogin = createLoginReqFixture({
                email: 'esto-no-es-un-email',
            });

            // Act & Assert - should return 400
            await request(app.getHttpServer())
                .post('/auth/login')
                .send(invalidLogin)
                .expect(400);
        });

        it('PATCH /auth/password - Should fail with 400 if new password is too short', async () => {
            // Arrange
            const { token } = await setupUser();
            const weakPwd = { newPassword: '123' };

            // Act & Assert - should return 400
            await request(app.getHttpServer())
                .patch('/auth/password')
                .set('Authorization', `Bearer ${token}`)
                .send(weakPwd)
                .expect(400);
        });

        it('GET /auth - Should return 401 if Authorization header is not sent', async () => {
            // Act & Assert - should return 401
            await request(app.getHttpServer())
                .get('/auth')
                .expect(401);
        });
    });
});
