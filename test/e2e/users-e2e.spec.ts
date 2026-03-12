import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import { UserStatus, IdGenerator, User, Errors } from 'src/commons';
import {
    createUserFixture,
    createAdminUserFixture,
    createEditBodyFixture,
    createDeleteBodyFixture,
} from '../../test/fixtures';
import { TestDatabaseHelper } from '../../test/utils/test-database.helper';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';

describe('User Module (e2e)', () => {
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

    const setupUser = async (overrides = {}) => {
        const id = IdGenerator.generateUUID();
        const userData = createUserFixture({
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
        it('GET /users/:id - Should get own profile correctly', async () => {
            // Arrange
            const { user, token } = await setupUser({
                fullName: 'John Doe',
            });

            // Act
            const response = await request(app.getHttpServer())
                .get(`/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - should have correct fullName
            expect(response.body.fullName).toBe('John Doe');
            // Assert - should not contain passwordHash
            expect(response.body).not.toHaveProperty('passwordHash');
        });

        it('PATCH /users/:id - Should update name and phone', async () => {
            // Arrange
            const { user, token } = await setupUser();
            const editBody = createEditBodyFixture({
                fullName: 'Nombre Actualizado',
                phoneNumber: '+5491188887777',
            });

            // Act
            const response = await request(app.getHttpServer())
                .patch(`/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(editBody);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - verify database record
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ id: user.id });
            expect(dbUser?.fullName).toBe('Nombre Actualizado');
        });

        it('DELETE /users/:id - Should mark user as DELETED', async () => {
            // Arrange
            const { user, token } = await setupUser({
                status: UserStatus.ACTIVE,
            });
            const deleteBody = createDeleteBodyFixture({
                password: 'Password123!',
            });

            jest.spyOn(
                authHelper,
                'validatePassword',
            ).mockResolvedValue(true);

            // Act
            const response = await request(app.getHttpServer())
                .delete(`/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(deleteBody);

            // Assert - should return 204
            expect(response.status).toBe(204);

            // Assert - user status should be DELETED in database
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ id: user.id });
            expect(dbUser?.status).toBe(UserStatus.DELETED);
        });
    });

    describe('DTO Validation (Bad Request Cases)', () => {
        it('PATCH /users/:id - Should fail if name contains invalid characters (Regex Name)', async () => {
            // Arrange
            const { user, token } = await setupUser();
            const invalidBody = { fullName: 'Juan123 Perez' };

            // Act
            const response = await request(app.getHttpServer())
                .patch(`/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(invalidBody);

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

        it('PATCH /users/:id - Should fail if phone does not meet international format (Regex Phone)', async () => {
            // Arrange
            const { user, token } = await setupUser();
            const invalidBody = {
                fullName: 'Juan Perez',
                phoneNumber: '12345',
            };

            // Act
            const response = await request(app.getHttpServer())
                .patch(`/users/${user.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(invalidBody);

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

    describe('Guard Validation (Security Cases)', () => {
        it('Should return 401 Unauthorized if JWT token is not sent', async () => {
            // Act
            const response = await request(app.getHttpServer()).get(
                `/users/${IdGenerator.generateUUID()}`,
            );

            // Assert
            expect(response.status).toBe(Errors.UNAUTHORIZED.status);
            expect(response.body.status).toBe(
                Errors.UNAUTHORIZED.status,
            );
            expect(response.body.message).toBe(
                Errors.UNAUTHORIZED.message,
            );
        });

        it('Should return 403 Forbidden if a CLIENT tries to delete another user', async () => {
            // Arrange
            const { token: clientToken } = await setupUser();
            const { user: otherUser } = await setupUser({
                email: 'other@test.com',
            });

            // Act
            const response = await request(app.getHttpServer())
                .delete(`/users/${otherUser.id}`)
                .set('Authorization', `Bearer ${clientToken}`)
                .send(createDeleteBodyFixture());

            // Assert
            expect(response.status).toBe(Errors.FORBIDDEN.status);
            expect(response.body.status).toBe(
                Errors.FORBIDDEN.status,
            );
            expect(response.body.message).toBe(
                Errors.FORBIDDEN.message,
            );
        });

        it('Should allow an ADMIN to delete (BANNED) any user', async () => {
            // Arrange
            const adminData = createAdminUserFixture({
                id: IdGenerator.generateUUID(),
            });
            const adminModel = UserEntityMapper.toModel(
                adminData as any,
            );
            await dataSource
                .getRepository(UserModel)
                .save(adminModel!);
            const adminToken = (
                await authHelper.createToken(
                    Object.assign(new User(), adminData),
                )
            ).accessToken;

            const { user: targetUser } = await setupUser({
                email: 'target@test.com',
            });

            // Act
            const response = await request(app.getHttpServer())
                .delete(`/users/${targetUser.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ password: '' });

            // Assert - should return 204
            expect(response.status).toBe(204);

            // Assert - user status should be BANNED
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ id: targetUser.id });
            expect(dbUser?.status).toBe(UserStatus.BANNED);
        });
    });
});
