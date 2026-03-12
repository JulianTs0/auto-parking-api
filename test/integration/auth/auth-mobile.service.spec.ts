import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { IdGenerator, Role, User } from 'src/commons';
import { AuthMobileService } from 'src/auth/domain/services/mobile/auth-mobile.service';
import { AuthService } from 'src/auth/domain/services/core/auth.service';
import { AuthServiceI } from 'src/auth/domain/services/core/auth-service.interface';
import { UserService } from 'src/users/domain/services/core/user.service';
import { UserInternalServiceI } from 'src/users/domain/services/core/user-service.interface';
import { UserRepository } from 'src/users/persistance/repository/user.repository';
import { UserRepositoryI } from 'src/users/domain/repository/user-repository.interface';
import { PostgresUserDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-user.dao';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';
import { TestDatabaseHelper } from '../../utils/test-database.helper';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { RegisterReq } from 'src/auth/domain/dto/auth/request/register.request.dto';
import {
    createCreateUserDtoFixture,
    createUserFixture,
} from '../../fixtures/auth.fixtures';
import { UserEntityMapper } from 'src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { AuthEvents } from 'src/auth/config/utils/auth-events.enum';

describe('AuthMobileService (Pure Integration)', () => {
    let service: AuthMobileService;
    let dbHelper: TestDatabaseHelper;
    let userTypeOrmRepo: Repository<UserModel>;
    let authHelperMock: jest.Mocked<AuthHelper>;
    let eventPublisherMock: jest.Mocked<EventPublisherI>;

    beforeAll(async () => {
        authHelperMock = {
            createToken: jest
                .fn()
                .mockResolvedValue({ accessToken: 'jwt-mob' }),
            hashPassword: jest.fn().mockResolvedValue('hash-mob'),
            validatePassword: jest.fn(),
        } as any;

        eventPublisherMock = { emit: jest.fn() } as any;

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
                    host: process.env.DB_HOST || 'localhost',
                    port: parseInt(process.env.DB_PORT || '5433', 10),
                    username: process.env.DB_USERNAME || 'tester',
                    password: process.env.DB_PASSWORD || 'tester',
                    database:
                        process.env.DB_DATABASE ||
                        'auto_parking_test',
                    entities: [UserModel],
                    synchronize: true,
                    dropSchema: true,
                }),
                TypeOrmModule.forFeature([UserModel]),
            ],
            providers: [
                AuthMobileService,
                {
                    provide: AuthServiceI,
                    useClass: AuthService,
                },
                {
                    provide: UserInternalServiceI,
                    useClass: UserService,
                },
                {
                    provide: UserRepositoryI,
                    useClass: UserRepository,
                },
                UserRepository,
                PostgresUserDao,
                {
                    provide: AuthHelper,
                    useValue: authHelperMock,
                },
                {
                    provide: EventPublisherI,
                    useValue: eventPublisherMock,
                },
                TestDatabaseHelper,
            ],
        }).compile();

        service = module.get<AuthMobileService>(AuthMobileService);
        dbHelper = module.get<TestDatabaseHelper>(TestDatabaseHelper);
        userTypeOrmRepo = module.get<Repository<UserModel>>(
            getRepositoryToken(UserModel),
        );
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

    describe('register() - Integration with Postgres', () => {
        it('should register user with CLIENT role atomically in database', async () => {
            // Arrange
            const registerDto = createCreateUserDtoFixture({
                fullName: 'Mobile User',
                email: 'mobile@test.com',
            } as RegisterReq);

            // Act
            await service.register(registerDto);

            // Assert
            const dbRecord = await userTypeOrmRepo.findOneBy({
                email: 'mobile@test.com',
            });
            expect(dbRecord).toBeDefined();
            expect(dbRecord?.fullName).toBe('Mobile User');
            expect(dbRecord?.roles).toContain(Role.CLIENT);

            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.REGISTER,
                expect.objectContaining({
                    user: expect.objectContaining({
                        email: 'mobile@test.com',
                    }),
                }),
            );
        });

        it('should do ROLLBACK if save fails due to integrity violation (null email)', async () => {
            // Arrange
            const registerDto = createCreateUserDtoFixture({
                email: null as any,
            } as RegisterReq);

            // Act & Assert
            await expect(
                service.register(registerDto),
            ).rejects.toThrow();

            const count = await userTypeOrmRepo.count();
            expect(count).toBe(0);
        });
    });
});
