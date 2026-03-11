import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, Role, IdGenerator } from 'src/commons';
import { UserService } from 'src/users/domain/services/core/user.service';
import { UserRepository } from 'src/users/persistance/repository/user.repository';
import { PostgresUserDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-user.dao';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { createUserFixture } from '../../fixtures/auth.fixtures';
import { UserRepositoryI } from 'src/users/domain/repository/user-repository.interface';
import { DeleteReq } from 'src/users/domain/dto/users/request/delete.request.dto';
import { DataSource } from 'typeorm';
import { DeleteBody } from 'src/users/domain/dto/users/request/delete.body.dto';
import { EditBody } from 'src/users/domain/dto/users/request/edit.body.dto';
import { EditReq } from 'src/users/domain/dto/users/request/edit.request.dto';
import { GetByIdReq } from 'src/users/domain/dto/users/request/get-by-id.request.dto';
import { TestDatabaseHelper } from '../../utils/test-database.helper';
import { toMockEntity } from '../../utils/entity-mocks.utils';
import { createMockAuthHelper } from '../../utils/test-mocks.utils';

describe('UserService (Integration - Database Effects)', () => {
    let service: UserService;
    let dbHelper: TestDatabaseHelper;
    let userTypeOrmRepo: Repository<UserModel>;
    let authHelperMock: jest.Mocked<AuthHelper>;

    beforeAll(async () => {
        const mockAuthHelper = createMockAuthHelper();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ClsModule.forRoot({
                    global: true,
                    middleware: { mount: true },
                    plugins: [
                        new ClsPluginTransactional({
                            adapter: new TransactionalAdapterTypeOrm({
                                dataSourceToken: DataSource,
                            }),
                        }),
                    ],
                }),
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: 'localhost',
                    port: 5433,
                    username: 'tester',
                    password: 'tester',
                    database: 'auto_parking_test',
                    entities: [UserModel],
                    synchronize: true,
                    dropSchema: true,
                }),
                TypeOrmModule.forFeature([UserModel]),
            ],
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useClass: UserRepository,
                },
                {
                    provide: UserRepositoryI,
                    useExisting: UserRepository,
                },
                PostgresUserDao,
                {
                    provide: AuthHelper,
                    useValue: mockAuthHelper,
                },
                TestDatabaseHelper,
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        dbHelper = module.get<TestDatabaseHelper>(TestDatabaseHelper);
        userTypeOrmRepo = module.get<Repository<UserModel>>(
            getRepositoryToken(UserModel),
        );
        authHelperMock = module.get(AuthHelper);
    });

    afterAll(async () => {
        await dbHelper.closeConnection();
    });

    beforeEach(async () => {
        await dbHelper.cleanDatabase();
        jest.clearAllMocks();
    });

    const seedUser = async (overrides = {}): Promise<User> => {
        const user = createUserFixture({
            id: IdGenerator.generateUUID(),
            ...overrides,
        }) as unknown as User;
        const model = UserEntityMapper.toModel(user);
        await userTypeOrmRepo.save(model!);
        return user;
    };

    describe('Transactions and Rollback (Pure Integration)', () => {
        it('should ROLLBACK in edit() if DB constraint violation occurs', async () => {
            // Arrange
            const user = await seedUser({
                fullName: 'Original Name',
                phoneNumber: '111222333',
            });

            const request = new EditReq({
                id: user.id,
                authUser: toMockEntity(user),
                body: new EditBody({
                    fullName: null as any,
                    phoneNumber: '999888777',
                }),
            });

            // Act
            await expect(service.edit(request)).rejects.toThrow();

            // Assert - original values should be preserved
            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.fullName).toBe('Original Name');
            expect(dbRecord?.phoneNumber).toBe('111222333');
        });

        it('should maintain integrity if process fails (rollback demonstration)', async () => {
            const user = await seedUser({
                status: UserStatus.ACTIVE,
            });

            const request = new EditReq({
                id: user.id,
                authUser: toMockEntity(user),
                body: new EditBody({
                    fullName: 'A'.repeat(1000),
                    phoneNumber: '123',
                }),
            });

            await expect(service.edit(request)).rejects.toThrow();

            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.fullName).not.toBe('A'.repeat(1000));
        });
    });

    describe('delete() - DB Effects', () => {
        it('should physically persist BANNED status in Postgres when Admin executes action', async () => {
            const target = await seedUser({
                status: UserStatus.ACTIVE,
            });

            const admin = toMockEntity(createUserFixture(), {
                isAdmin: () => true,
            });

            const request = new DeleteReq({
                id: target.id,
                authUser: admin,
                body: new DeleteBody({ password: '' }),
            });

            // Act
            await service.delete(request);

            // Assert - user status should be BANNED
            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: target.id,
            });
            expect(dbRecord?.status).toBe(UserStatus.BANNED);
        });

        it('should physically persist DELETED status in Postgres when user deletes themselves', async () => {
            const user = await seedUser({
                status: UserStatus.ACTIVE,
            });
            authHelperMock.validatePassword.mockResolvedValue(true);

            // Use real DeleteReq DTO
            const request = new DeleteReq({
                id: user.id,
                authUser: toMockEntity(user),
                body: new DeleteBody({ password: 'valid-password' }),
            });

            // Act
            await service.delete(request);

            // Assert - user status should be DELETED
            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.status).toBe(UserStatus.DELETED);
        });
    });

    describe('edit() - DB Effects', () => {
        it('should update and persist fullName and phoneNumber changes in database', async () => {
            const user = await seedUser({
                fullName: 'Old Name',
            });

            const request = new EditReq({
                id: user.id,
                authUser: toMockEntity(user),
                body: new EditBody({
                    fullName: 'New Name',
                    phoneNumber: '+5491187654321',
                }),
            });

            // Act
            await service.edit(request);

            // Assert - values should be persisted
            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.fullName).toBe('New Name');
            expect(dbRecord?.phoneNumber).toBe('+5491187654321');
        });
    });

    describe('getById() - Integration with Mappers', () => {
        it('should return DTO that does not contain password_hash', async () => {
            const user = await seedUser({
                passwordHash: 'secure-hash',
            });

            const request = new GetByIdReq({ id: user.id });

            // Act
            const result = await service.getById(request);

            // Assert - should return user id
            expect(result.id).toBe(user.id);
            // Assert - should not have passwordHash property
            expect(result).not.toHaveProperty('passwordHash');
        });
    });
});
