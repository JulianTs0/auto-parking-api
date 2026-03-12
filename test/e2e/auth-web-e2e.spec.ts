import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app.module';
import {
    UserStatus,
    IdGenerator,
    User,
    Role,
    OwnerRequestStatus,
    Errors,
} from 'src/commons';
import {
    createUserFixture,
    createAdminUserFixture,
    createOwnerUserFixture,
    createCreateUserDtoFixture,
} from '../../test/fixtures';
import { TestDatabaseHelper } from '../../test/utils/test-database.helper';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { OwnerRequestModel } from 'src/users/persistance/datasource/data/postgres/models/owner-request.model';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';

describe('Auth Web Module (e2e)', () => {
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

    const setupUser = async (
        fixtureFactory: Function = createUserFixture,
        overrides = {},
    ) => {
        const id = IdGenerator.generateUUID();
        const userData = fixtureFactory({
            id,
            email: `web_${id}@test.com`,
            ...overrides,
        });

        const model = UserEntityMapper.toModel(userData as any);
        await dataSource.getRepository(UserModel).save(model!);

        const token = await authHelper.createToken(
            Object.assign(new User(), userData),
        );

        return { user: userData, token: token.accessToken };
    };

    describe('Success Cases', () => {
        it('POST /web/auth/register - Should register an INACTIVE owner with PENDING request (201)', async () => {
            // Arrange
            const registerDto = createCreateUserDtoFixture({
                email: 'new_owner@test.com',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/web/auth/register')
                .send(registerDto);

            // Assert - should return 201
            expect(response.status).toBe(201);

            // Assert - verify user in database
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ email: 'new_owner@test.com' });
            expect(dbUser?.status).toBe(UserStatus.INACTIVE);
            expect(dbUser?.roles).toContain(Role.CLIENT);

            // Assert - verify owner request
            const dbRequest = await dataSource
                .getRepository(OwnerRequestModel)
                .findOne({
                    where: { user: { id: dbUser?.id } },
                });
            expect(dbRequest?.status).toBe(
                OwnerRequestStatus.PENDING,
            );
        });

        it('POST /web/auth/employee/register - An OWNER should register an employee (201)', async () => {
            // Arrange
            const { token: ownerToken } = await setupUser(
                createOwnerUserFixture,
            );
            const employeeDto = createCreateUserDtoFixture({
                email: 'employee@test.com',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/web/auth/employee/register')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(employeeDto);

            // Assert - should return 201
            expect(response.status).toBe(201);

            // Assert - verify employee in database
            const dbEmployee = await dataSource
                .getRepository(UserModel)
                .findOneBy({ email: 'employee@test.com' });
            expect(dbEmployee?.roles).toContain(Role.EMPLOYEE);
            expect(dbEmployee?.roles).toContain(Role.CLIENT);
        });

        it('PATCH /web/auth/request/upgrade/owner - A CLIENT should be able to request upgrade to OWNER (200)', async () => {
            // Arrange
            const { user, token: clientToken } =
                await setupUser(createUserFixture);

            // Act
            const response = await request(app.getHttpServer())
                .patch('/web/auth/request/upgrade/owner')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ email: user.email });

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - verify request in database
            const dbRequest = await dataSource
                .getRepository(OwnerRequestModel)
                .findOne({
                    where: { user: { id: user.id } },
                });
            expect(dbRequest?.status).toBe(
                OwnerRequestStatus.PENDING,
            );
        });

        it('PATCH /web/auth/accept/owner - An ADMIN should be able to accept owner request (200)', async () => {
            // Arrange
            const { token: adminToken } = await setupUser(
                createAdminUserFixture,
            );
            const { user: targetUser } = await setupUser(
                createUserFixture,
                { status: UserStatus.INACTIVE },
            );

            // Seed a manual PENDING request
            await dataSource.getRepository(OwnerRequestModel).save({
                id: IdGenerator.generateUUID(),
                user: { id: targetUser.id },
                status: OwnerRequestStatus.PENDING,
            });

            // Act
            const response = await request(app.getHttpServer())
                .patch('/web/auth/accept/owner')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ownerEmail: targetUser.email });

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - verify request status changed to APPROVED
            const updatedReq = await dataSource
                .getRepository(OwnerRequestModel)
                .findOne({
                    where: { user: { id: targetUser.id } },
                });
            expect(updatedReq?.status).toBe(
                OwnerRequestStatus.APPROVED,
            );
        });

        it('PATCH /web/auth/upgrade - Should finalize upgrade to OWNER (200)', async () => {
            // Arrange
            const { user, token: clientToken } = await setupUser(
                createUserFixture,
                { status: UserStatus.INACTIVE },
            );

            // Seed an APPROVED request
            await dataSource.getRepository(OwnerRequestModel).save({
                id: IdGenerator.generateUUID(),
                user: { id: user.id },
                status: OwnerRequestStatus.APPROVED,
            });

            // Act
            const response = await request(app.getHttpServer())
                .patch('/web/auth/upgrade')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ email: user.email });

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - verify user has OWNER role
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ id: user.id });
            expect(dbUser?.roles).toContain(Role.OWNER);
            expect(dbUser?.status).toBe(UserStatus.ACTIVE);

            // Assert - verify request status changed to COMPLETED
            const updatedReq = await dataSource
                .getRepository(OwnerRequestModel)
                .findOne({
                    where: { user: { id: user.id } },
                });
            expect(updatedReq?.status).toBe(
                OwnerRequestStatus.COMPLETED,
            );
        });

        it('GET /web/auth/owner/requests - An ADMIN should get paginated requests (200)', async () => {
            // Arrange
            const { token: adminToken } = await setupUser(
                createAdminUserFixture,
            );

            // Act
            const response = await request(app.getHttpServer())
                .get('/web/auth/owner/requests?page=1&size=10')
                .set('Authorization', `Bearer ${adminToken}`);

            // Assert - should return 200
            expect(response.status).toBe(200);

            // Assert - response should have correct structure
            expect(response.body).toHaveProperty('requests');
            expect(response.body).toHaveProperty('nextPage');
            expect(Array.isArray(response.body.requests)).toBe(true);
        });
    });

    describe('DTO Validation (Bad Request Cases)', () => {
        it('POST /web/auth/register - Should fail with 400 if email is invalid', async () => {
            // Arrange
            const invalidDto = createCreateUserDtoFixture({
                email: 'correo-falso',
            });

            // Act
            const response = await request(app.getHttpServer())
                .post('/web/auth/register')
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

        it('GET /web/auth/owner/requests - Should fail with 400 if size exceeds maximum (25)', async () => {
            // Arrange
            const { token: adminToken } = await setupUser(
                createAdminUserFixture,
            );

            // Act
            const response = await request(app.getHttpServer())
                .get('/web/auth/owner/requests?page=1&size=100')
                .set('Authorization', `Bearer ${adminToken}`);

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
        it('POST /web/auth/employee/register - Should fail with 403 if CLIENT tries to register employee', async () => {
            // Arrange
            const { token: clientToken } =
                await setupUser(createUserFixture); // CLIENT role
            const employeeDto = createCreateUserDtoFixture();

            // Act
            const response = await request(app.getHttpServer())
                .post('/web/auth/employee/register')
                .set('Authorization', `Bearer ${clientToken}`)
                .send(employeeDto);

            // Assert
            expect(response.status).toBe(Errors.FORBIDDEN.status);
            expect(response.body.status).toBe(
                Errors.FORBIDDEN.status,
            );
            expect(response.body.message).toBe(
                Errors.FORBIDDEN.message,
            );
        });

        it('PATCH /web/auth/accept/owner - Should fail with 403 if OWNER tries to accept request (requires ADMIN)', async () => {
            // Arrange
            const { token: ownerToken } = await setupUser(
                createOwnerUserFixture,
            ); // OWNER role

            // Act
            const response = await request(app.getHttpServer())
                .patch('/web/auth/accept/owner')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ ownerEmail: 'target@test.com' });

            // Assert
            expect(response.status).toBe(Errors.FORBIDDEN.status);
            expect(response.body.status).toBe(
                Errors.FORBIDDEN.status,
            );
            expect(response.body.message).toBe(
                Errors.FORBIDDEN.message,
            );
        });

        it('PATCH /web/auth/request/upgrade/owner - Should fail with 401 if no token is sent', async () => {
            // Act
            const response = await request(app.getHttpServer())
                .patch('/web/auth/request/upgrade/owner')
                .send({ email: 'target@test.com' });

            // Assert
            expect(response.status).toBe(Errors.UNAUTHORIZED.status);
            expect(response.body.status).toBe(
                Errors.UNAUTHORIZED.status,
            );
            expect(response.body.message).toBe(
                Errors.UNAUTHORIZED.message,
            );
        });
    });

    describe('Multi-step Flows', () => {
        it('should complete full owner upgrade flow', async () => {
            // Arrange - 1. POST /web/auth/register -> creates user + owner request PENDING
            const newOwnerEmail = 'full_flow_owner@test.com';
            const registerDto = createCreateUserDtoFixture({
                email: newOwnerEmail,
            });

            // Act
            let response = await request(app.getHttpServer())
                .post('/web/auth/register')
                .send(registerDto);

            // Assert
            expect(response.status).toBe(201);

            // Arrange - 2. PATCH /web/auth/accept/owner -> admin approves -> status APPROVED
            const { token: adminToken } = await setupUser(
                createAdminUserFixture,
            );

            // Act
            response = await request(app.getHttpServer())
                .patch('/web/auth/accept/owner')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ownerEmail: newOwnerEmail });

            // Assert
            expect(response.status).toBe(200);

            // Arrange - 3. Get user and token to simulate user doing the upgrade
            const dbUser = await dataSource
                .getRepository(UserModel)
                .findOneBy({ email: newOwnerEmail });

            const clientToken = (
                await authHelper.createToken(
                    Object.assign(new User(), dbUser),
                )
            ).accessToken;

            // Act - 4. PATCH /web/auth/upgrade -> user completes upgrade -> role OWNER + status ACTIVE
            response = await request(app.getHttpServer())
                .patch('/web/auth/upgrade')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ email: newOwnerEmail });

            // Assert
            expect(response.status).toBe(200);

            // Act - 5. GET /auth -> verify the correct role is applied
            response = await request(app.getHttpServer())
                .get('/auth')
                .set('Authorization', `Bearer ${clientToken}`);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.roles).toContain(Role.OWNER);
            expect(response.body.status).toBe(UserStatus.ACTIVE);
        });
    });
});
