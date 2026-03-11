import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
    User,
    UserStatus,
    Role,
    IdGenerator,
    OwnerRequestStatus,
} from 'src/commons';
import { AuthWebService } from 'src/auth/domain/services/web/auth-web.service';
import { AuthService } from 'src/auth/domain/services/core/auth.service';
import { AuthServiceI } from 'src/auth/domain/services/core/auth-service.interface';
import { UserService } from 'src/users/domain/services/core/user.service';
import { UserInternalServiceI } from 'src/users/domain/services/core/user-service.interface';
import { OwnerRequestService } from 'src/users/domain/services/core/owner-request.service';
import { OwnerRequestInternalServiceI } from 'src/users/domain/services/core/owner-request-service.interface';
import { UserRepository } from 'src/users/persistance/repository/user.repository';
import { UserRepositoryI } from 'src/users/domain/repository/user-repository.interface';
import { OwnerRequestRepository } from 'src/users/persistance/repository/owner-request.repository';
import { OwnerRequestRepositoryI } from 'src/users/domain/repository/owner-request-repository.interface';
import { PostgresUserDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-user.dao';
import { PostgresOwnerRequestDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-owner-request.dao';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { OwnerRequestModel } from 'src/users/persistance/datasource/data/postgres/models/owner-request.model';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TestDatabaseHelper } from '../../utils//test-database.helper';
import {
    createCreateUserDtoFixture,
    createOwnerRequestFixture,
    createUserFixture,
} from '../../fixtures';
import { RegisterReq } from 'src/auth/domain/dto/auth/request/register.request.dto';
import { UpgradeToOwnerReq } from 'src/auth/domain/dto/auth/request/upgrade-to-owner.request.dto';
import { UpgradeToOwnerBody } from 'src/auth/domain/dto/auth/request/upgrade-to-owner.body.dto';

describe('AuthWebService (Pure Integration)', () => {
    let service: AuthWebService;
    let dbHelper: TestDatabaseHelper;
    let userTypeOrmRepo: Repository<UserModel>;
    let ownerReqTypeOrmRepo: Repository<OwnerRequestModel>;
    let authHelperMock: jest.Mocked<AuthHelper>;

    beforeAll(async () => {
        authHelperMock = {
            createToken: jest
                .fn()
                .mockResolvedValue({ accessToken: 'jwt-web' }),
            hashPassword: jest.fn().mockResolvedValue('hash-web'),
            validatePassword: jest.fn(),
        } as any;

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
                    entities: [UserModel, OwnerRequestModel],
                    synchronize: true,
                    dropSchema: true,
                }),
                TypeOrmModule.forFeature([
                    UserModel,
                    OwnerRequestModel,
                ]),
            ],
            providers: [
                AuthWebService,
                { provide: AuthServiceI, useClass: AuthService },
                {
                    provide: UserInternalServiceI,
                    useClass: UserService,
                },
                {
                    provide: OwnerRequestInternalServiceI,
                    useClass: OwnerRequestService,
                },
                {
                    provide: UserRepositoryI,
                    useClass: UserRepository,
                },
                {
                    provide: OwnerRequestRepositoryI,
                    useClass: OwnerRequestRepository,
                },
                UserRepository,
                OwnerRequestRepository,
                PostgresUserDao,
                PostgresOwnerRequestDao,
                { provide: AuthHelper, useValue: authHelperMock },
                {
                    provide: EventPublisherI,
                    useValue: { emit: jest.fn() },
                },
                TestDatabaseHelper,
            ],
        }).compile();

        service = module.get<AuthWebService>(AuthWebService);
        dbHelper = module.get<TestDatabaseHelper>(TestDatabaseHelper);
        userTypeOrmRepo = module.get<Repository<UserModel>>(
            getRepositoryToken(UserModel),
        );
        ownerReqTypeOrmRepo = module.get<
            Repository<OwnerRequestModel>
        >(getRepositoryToken(OwnerRequestModel));
    });

    afterAll(async () => {
        await dbHelper.closeConnection();
    });

    beforeEach(async () => {
        await dbHelper.cleanDatabase();
        jest.clearAllMocks();
    });

    const seedUser = async (overrides = {}): Promise<User> => {
        const data = createUserFixture({
            id: IdGenerator.generateUUID(),
            ...overrides,
        });
        const model = UserEntityMapper.toModel(data as any);
        await userTypeOrmRepo.save(model!);
        return Object.assign(new User(), data);
    };

    describe('register() - Orquestación User + OwnerRequest', () => {
        it('should register user as INACTIVE and create OwnerRequest atomically', async () => {
            // Arrange
            const registerDto = createCreateUserDtoFixture({
                fullName: 'Web Owner',
                email: 'owner@web.com',
            } as RegisterReq);

            // Act
            await service.register(registerDto);

            // Assert
            const userInDb = await userTypeOrmRepo.findOneBy({
                email: 'owner@web.com',
            });
            expect(userInDb).toBeDefined();
            expect(userInDb?.status).toBe(UserStatus.INACTIVE);
            expect(userInDb?.roles).toContain(Role.CLIENT);

            // Assert
            const requestInDb = await ownerReqTypeOrmRepo.findOne({
                where: { user: { id: userInDb?.id } },
            });
            expect(requestInDb).toBeDefined();
            expect(requestInDb?.status).toBe(
                OwnerRequestStatus.PENDING,
            );
        });

        it('should do FULL ROLLBACK if request creation fails', async () => {
            // Arrange
            const registerDto = createCreateUserDtoFixture({
                fullName: 'A'.repeat(500),
                email: 'fail@web.com',
            } as RegisterReq);

            // Act & Assert
            await expect(
                service.register(registerDto),
            ).rejects.toThrow();

            const userInDb = await userTypeOrmRepo.findOneBy({
                email: 'fail@web.com',
            });
            expect(userInDb).toBeNull();
        });
    });

    describe('upgrade() - Integración con Postgres', () => {
        it('should convert user to OWNER and mark request as COMPLETED', async () => {
            // Arrange
            const user = await seedUser({
                email: 'upgrade@test.com',
            });

            const ownerReqData = createOwnerRequestFixture({
                id: IdGenerator.generateUUID(),
                user,
                status: OwnerRequestStatus.APPROVED,
            });

            const modelData = new OwnerRequestModel();
            Object.assign(modelData, ownerReqData);
            modelData.user = (await userTypeOrmRepo.findOneBy({
                id: user.id,
            }))!;
            await ownerReqTypeOrmRepo.save(modelData);

            // Act
            await service.upgrade(
                new UpgradeToOwnerReq({
                    body: new UpgradeToOwnerBody({
                        email: 'upgrade@test.com',
                    }),
                }),
            );

            // Assert
            const updatedUser = await userTypeOrmRepo.findOneBy({
                id: user.id,
            });
            expect(updatedUser?.roles).toContain(Role.OWNER);
            expect(updatedUser?.status).toBe(UserStatus.ACTIVE);

            // Assert
            const updatedReq = await ownerReqTypeOrmRepo.findOneBy({
                id: ownerReqData.id,
            });
            expect(updatedReq?.status).toBe(
                OwnerRequestStatus.COMPLETED,
            );
        });
    });
});
