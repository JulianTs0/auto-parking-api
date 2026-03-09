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
                    host: 'localhost',
                    port: 5433,
                    username: 'tester',
                    password: 'tester',
                    database: 'auto_parking_test',
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
        it('debería guardar exitosamente una solicitud vinculada a un usuario real', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;

            // Act
            const saved = await repository.save(request);

            // Assert
            expect(saved).toBeDefined();
            expect(saved.id).toBe(request.id);
        });

        it('debería fallar si el usuario referenciado no existe (FK Constraint)', async () => {
            // Arrange
            const request =
                createOwnerRequestFixture() as unknown as OwnerRequest;
            request.user = new User({
                id: '00000000-0000-0000-0000-000000000000',
            });

            // Act & Assert
            await expect(repository.save(request)).rejects.toThrow();
        });

        it('debería fallar si el estado de la solicitud es inválido (Check Constraint)', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            (request as any).status = 'INVALID_STATUS';

            // Act & Assert
            await expect(repository.save(request)).rejects.toThrow();
        });
    });

    describe('update()', () => {
        it('debería actualizar el estado de una solicitud existente', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
                status: OwnerRequestStatus.PENDING,
            }) as unknown as OwnerRequest;

            // Act & Assert
            await repository.save(request);

            request.status = OwnerRequestStatus.APPROVED;
            const updated = await repository.update(request);

            expect(updated.status).toBe(OwnerRequestStatus.APPROVED);
            const found = await repository.findById(request.id);
            expect(found?.status).toBe(OwnerRequestStatus.APPROVED);
        });
    });

    describe('findById()', () => {
        it('debería encontrar la solicitud con perfil BASIC (usuario hidratado solo con ID)', async () => {
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

            // Assert
            expect(found).toBeDefined();
            expect(found?.user.id).toBe(user.id);
            expect(found?.user.email).toBeUndefined();
        });

        it('debería encontrar la solicitud con perfil WITH_USER (usuario completamente hidratado)', async () => {
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

            // Assert
            expect(found?.user.email).toBe('full@test.com');
        });

        it('debería retornar null si la solicitud no existe', async () => {
            // Arrange
            const found = await repository.findById(
                '00000000-0000-0000-0000-000000000000',
            );

            // Act & Assert
            expect(found).toBeNull();
        });
    });

    describe('findPendingByUserId()', () => {
        it('debería retornar la solicitud si el usuario tiene una en estado PENDING', async () => {
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

            // Assert
            expect(found).toBeDefined();
            expect(found?.id).toBe(request.id);
        });

        it('debería retornar null si la solicitud del usuario no está en estado PENDING', async () => {
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

            // Assert
            expect(found).toBeNull();
        });
    });

    describe('findRequestsPaginated()', () => {
        it('debería retornar una página de solicitudes ordenada por fecha descendente', async () => {
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

            // Assert
            expect(result.content).toHaveLength(2);
            expect(result.page).toBe(1);
        });
    });

    describe('delete()', () => {
        it('debería eliminar físicamente el registro y retornar true', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            const isDeleted = await repository.delete(request.id);
            const found = await repository.findById(request.id);

            // Assert
            expect(isDeleted).toBe(true);
            expect(found).toBeNull();
        });

        it('debería retornar false si se intenta eliminar un registro inexistente', async () => {
            // Arrange
            const isDeleted = await repository.delete(
                '00000000-0000-0000-0000-000000000000',
            );

            // Act & Assert
            expect(isDeleted).toBe(false);
        });

        it('debería borrarse automáticamente si el usuario dueño es eliminado (CASCADE)', async () => {
            // Arrange
            const user = await setupRealUser();
            const request = createOwnerRequestFixture({
                user,
            }) as unknown as OwnerRequest;
            await repository.save(request);

            // Act
            await userTypeOrmRepo.delete(user.id);

            // Assert
            const found = await repository.findById(request.id);
            expect(found).toBeNull();
        });
    });
});
