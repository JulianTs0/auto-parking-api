import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerRequest, OwnerRequestStatus, User } from 'src/commons';
import { OwnerRequestRepository } from 'src/users/persistance/repository/owner-request.repository';
import { PostgresOwnerRequestDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-owner-request.dao';
import { OwnerRequestModel } from 'src/users/persistance/datasource/data/postgres/models/owner-request.model';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { OwnerRequestLoadProfile } from 'src/users/persistance/datasource/data/postgres/profiles/owner-request-load.profile';
import { TestDatabaseHelper } from '../../utils/test-database.helper';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { createUserFixture } from '../../fixtures/auth.fixtures';
import { createOwnerRequestFixture } from '../../fixtures/owner-request.fixtures';

describe('OwnerRequestRepository (Integration)', () => {
    let repository: OwnerRequestRepository;
    let dbHelper: TestDatabaseHelper;
    let userTypeOrmRepo: Repository<UserModel>;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT || '5433', 10),
                    username: process.env.DB_USERNAME || 'tester',
                    password: process.env.DB_PASSWORD || 'tester',
                    database:
                        process.env.DB_DATABASE ||
                        'auto_parking_test',
                    entities: [OwnerRequestModel, UserModel],
                    synchronize: true,
                    dropSchema: true,
                }),
                TypeOrmModule.forFeature([
                    OwnerRequestModel,
                    UserModel,
                ]),
            ],
            providers: [
                PostgresOwnerRequestDao,
                OwnerRequestRepository,
                TestDatabaseHelper,
            ],
        }).compile();

        repository = module.get<OwnerRequestRepository>(
            OwnerRequestRepository,
        );
        dbHelper = module.get<TestDatabaseHelper>(TestDatabaseHelper);
        userTypeOrmRepo = module.get<Repository<UserModel>>(
            getRepositoryToken(UserModel),
        );
    });

    afterAll(async () => {
        await dbHelper.closeConnection();
        await module.close();
    });

    beforeEach(async () => {
        await dbHelper.cleanDatabase();
    });

    const setupRealUser = async (overrides = {}): Promise<User> => {
        const fixture = createUserFixture(
            overrides,
        ) as unknown as User;
        const modelData = UserEntityMapper.toModel(fixture);
        const model = userTypeOrmRepo.create(modelData!);
        await userTypeOrmRepo.save(model);
        return fixture;
    };

    describe('save()', () => {
        it('should successfully save a request linked to a real user', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;

            // Act
            const saved = await repository.save(request);

            // Assert - saved should be defined
            expect(saved).toBeDefined();
            // Assert - should have correct id
            expect(saved.id).toBe(request.id);
        });

        it('should fail if referenced user does not exist (FK Constraint)', async () => {
            // Arrange
            const request =
                createOwnerRequestFixture() as unknown as OwnerRequest;
            request.user = new User({
                id: '00000000-0000-0000-0000-000000000000',
            });

            // Act & Assert - should throw error
            await expect(repository.save(request)).rejects.toThrow();
        });

        it('should fail if request status is invalid (Check Constraint)', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            (request as any).status = 'INVALID_STATUS';

            // Act & Assert - should throw error
            await expect(repository.save(request)).rejects.toThrow();
        });
    });

    describe('update()', () => {
        it('should update status of existing request', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
                status: OwnerRequestStatus.PENDING,
            }) as unknown as OwnerRequest;

            // Act & Assert - save first
            await repository.save(request);

            request.status = OwnerRequestStatus.APPROVED;
            const updated = await repository.update(request);

            // Assert - status should be APPROVED
            expect(updated.status).toBe(OwnerRequestStatus.APPROVED);
            const found = await repository.findById(request.id);
            expect(found?.status).toBe(OwnerRequestStatus.APPROVED);
        });
    });

    describe('findById()', () => {
        it('should find request with BASIC profile (user hydrated only with ID)', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            const found = await repository.findById(
                request.id,
                OwnerRequestLoadProfile.BASIC,
            );

            // Assert - should be defined
            expect(found).toBeDefined();
            // Assert - should have correct user id
            expect(found?.user.id).toBe(user.id);
            // Assert - email should be undefined (not hydrated)
            expect(found?.user.email).toBeUndefined();
        });

        it('should find request with WITH_USER profile (user fully hydrated)', async () => {
            // Arrange
            const user = await setupRealUser({
                email: 'full@test.com',
            });
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            const found = await repository.findById(
                request.id,
                OwnerRequestLoadProfile.WITH_USER,
            );

            // Assert - should have fully hydrated user with email
            expect(found?.user.email).toBe('full@test.com');
        });

        it('should return null if request does not exist', async () => {
            // Arrange
            const found = await repository.findById(
                '00000000-0000-0000-0000-000000000000',
            );

            // Act & Assert - should return null
            expect(found).toBeNull();
        });
    });

    describe('findPendingByUserId()', () => {
        it('should return request if user has one in PENDING status', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
                status: OwnerRequestStatus.PENDING,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            const found = await repository.findPendingByUserId(
                user.id,
            );

            // Assert - should be defined
            expect(found).toBeDefined();
            // Assert - should have correct id
            expect(found?.id).toBe(request.id);
        });

        it('should return null if user request is not in PENDING status', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
                status: OwnerRequestStatus.REJECTED,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            const found = await repository.findPendingByUserId(
                user.id,
            );

            // Assert - should return null
            expect(found).toBeNull();
        });
    });

    describe('findRequestsPaginated()', () => {
        it('should return a page of requests ordered by date descending', async () => {
            // Arrange
            const user = await setupRealUser();
            await repository.save(
                createOwnerRequestFixture({
                    id: '11111111-1111-1111-1111-111111111111',
                    user,
                }) as any,
            );
            await repository.save(
                createOwnerRequestFixture({
                    id: '22222222-2222-2222-2222-222222222222',
                    user,
                }) as any,
            );

            // Act
            const result = await repository.findRequestsPaginated(
                1,
                10,
            );

            // Assert - should have 2 items
            expect(result.content).toHaveLength(2);
            // Assert - should be on page 1
            expect(result.page).toBe(1);
        });
    });

    describe('delete()', () => {
        it('should physically delete record and return true', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            const isDeleted = await repository.delete(request.id);
            const found = await repository.findById(request.id);

            // Assert - should return true
            expect(isDeleted).toBe(true);
            // Assert - found should be null
            expect(found).toBeNull();
        });

        it('should return false if attempting to delete non-existent record', async () => {
            // Arrange
            const isDeleted = await repository.delete(
                '00000000-0000-0000-0000-000000000000',
            );

            // Act & Assert - should return false
            expect(isDeleted).toBe(false);
        });

        it('should automatically delete if owning user is deleted (CASCADE)', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            await userTypeOrmRepo.delete(user.id);

            // Assert - request should be null (cascade deleted)
            const found = await repository.findById(request.id);
            expect(found).toBeNull();
        });
    });
});
