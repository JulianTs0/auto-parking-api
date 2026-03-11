import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from 'src/auth/domain/services/core/auth.service';
import { UserService } from 'src/users/domain/services/core/user.service';
import { UserInternalServiceI } from 'src/users/domain/services/core/user-service.interface';
import { UserRepository } from 'src/users/persistance/repository/user.repository';
import { UserRepositoryI } from 'src/users/domain/repository/user-repository.interface';
import { PostgresUserDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-user.dao';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';
import { TestDatabaseHelper } from '../../utils/test-database.helper';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { createUserFixture } from '../../fixtures/auth.fixtures';
import { IdGenerator, Token, User, UserStatus } from 'src/commons';
import { VerifyEmailReq } from 'src/auth/domain/dto/auth/request/verify-email.request.dto';
import { LoginReq } from 'src/auth/domain/dto/auth/request/login.request.dto';
import { EditPasswordReq } from 'src/auth/domain/dto/auth/request/edit-password.request.dto';
import { EditPasswordBody } from 'src/auth/domain/dto/auth/request/edit-password.body.dto';
import { AuthEvents } from 'src/auth/config/utils/auth-events.enum';
import { RecoverPasswordReq } from 'src/auth/domain/dto/auth/request/recover-password.request.dto';
import { toMockEntity } from '../../utils//entity-mocks.utils';
import { createMockAuthHelper } from '../../utils/test-mocks.utils';

describe('AuthService (Integration - Database Effects & Rollback)', () => {
    let service: AuthService;
    let dbHelper: TestDatabaseHelper;
    let userTypeOrmRepo: Repository<UserModel>;
    let authHelperMock: jest.Mocked<AuthHelper>;
    let eventPublisherMock: jest.Mocked<EventPublisherI>;

    beforeAll(async () => {
        const mockAuthHelper = createMockAuthHelper();

        const mockEventPublisher = {
            emit: jest.fn(),
        };

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
                AuthService,
                UserService,
                {
                    provide: UserInternalServiceI,
                    useExisting: UserService,
                },
                {
                    provide: UserRepositoryI,
                    useClass: UserRepository,
                },
                PostgresUserDao,
                { provide: AuthHelper, useValue: mockAuthHelper },
                {
                    provide: EventPublisherI,
                    useValue: mockEventPublisher,
                },
                TestDatabaseHelper,
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        dbHelper = module.get<TestDatabaseHelper>(TestDatabaseHelper);
        userTypeOrmRepo = module.get<Repository<UserModel>>(
            getRepositoryToken(UserModel),
        );
        authHelperMock = module.get(AuthHelper);
        eventPublisherMock = module.get(EventPublisherI);
    });

    afterAll(async () => {
        await dbHelper.closeConnection();
    });

    beforeEach(async () => {
        await dbHelper.cleanDatabase();
        jest.clearAllMocks();
    });

    const seedUser = async (overrides = {}): Promise<User> => {
        const id = IdGenerator.generateUUID();
        const data = createUserFixture({ ...overrides, id });
        const model = UserEntityMapper.toModel(data as any);
        await userTypeOrmRepo.save(model!);
        return Object.assign(new User(), data);
    };

    describe('Transactions and Rollback (Pure Integration)', () => {
        it('should ROLLBACK in changePassword() if DB constraint violation occurs', async () => {
            // Arrange
            const user = await seedUser({
                passwordHash: 'hash-original',
            });

            const corruptedUser = toMockEntity(user);
            (corruptedUser as any).email = null;

            authHelperMock.hashPassword.mockResolvedValue(
                'new-hash-that-should-not-be-saved',
            );

            const request = new EditPasswordReq({
                authUser: corruptedUser,
                body: new EditPasswordBody({
                    newPassword: 'NuevaPassword123!',
                }),
            });

            await expect(
                service.changePassword(request),
            ).rejects.toThrow();

            // Assert - original password should be preserved
            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.passwordHash).toBe('hash-original');
        });
    });

    describe('Persistence (Happy Path)', () => {
        it('login() should physically update updatedAt in DB', async () => {
            const user = await seedUser({
                email: 'success@test.com',
                status: UserStatus.ACTIVE,
            });
            const oldDate = user.updatedAt;

            authHelperMock.validatePassword.mockResolvedValue(true);
            authHelperMock.createToken.mockResolvedValue({
                accessToken: 'token',
            } as Token);

            const loginReq = new LoginReq();
            (loginReq as any).email = 'success@test.com';
            (loginReq as any).password = 'Password123!';

            await service.login(loginReq);

            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.updatedAt.getTime()).toBeGreaterThan(
                oldDate.getTime(),
            );
        });

        it('verifyEmail() should physically change status to ACTIVE in DB', async () => {
            const user = await seedUser({
                status: UserStatus.INACTIVE,
            });
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue(user.id);

            await service.verifyEmail(
                new VerifyEmailReq({ token: 'raw-token' }),
            );

            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.status).toBe(UserStatus.ACTIVE);
        });

        it('changePassword() should persist new password hash', async () => {
            const user = await seedUser({ passwordHash: 'old-hash' });
            authHelperMock.hashPassword.mockResolvedValue(
                'new-secure-hash',
            );

            const request = new EditPasswordReq({
                authUser: toMockEntity(user),
                body: new EditPasswordBody({
                    newPassword: 'NewPassword123!',
                }),
            });

            await service.changePassword(request);

            const dbRecord = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(dbRecord?.passwordHash).toBe('new-secure-hash');
        });
    });

    describe('Event Orchestration', () => {
        it('recoverPassword() should emit RECOVER_PASSWORD event when data is correct', async () => {
            const user = await seedUser({
                email: 'events@test.com',
                status: UserStatus.ACTIVE,
            });
            authHelperMock.createToken.mockResolvedValue({
                accessToken: 'jwt',
            } as Token);

            await service.recoverPassword(
                new RecoverPasswordReq({ email: 'events@test.com' }),
            );

            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.RECOVER_PASSWORD,
                expect.objectContaining({
                    user: expect.objectContaining({ id: user.id }),
                }),
            );
        });
    });
});
