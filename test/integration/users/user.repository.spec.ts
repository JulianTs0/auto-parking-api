import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Role, User, UserStatus } from 'src/commons';
import { UserRepository } from 'src/users/persistance/repository/user.repository';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { TestDatabaseHelper } from '../../utils/test-database.helper';
import { PostgresUserDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-user.dao';
import { createUserFixture } from '../../fixtures/auth.fixtures';
import { Repository } from 'typeorm';

describe('UserRepository (Integration)', () => {
    let repository: UserRepository;
    let dbHelper: TestDatabaseHelper;
    let typeOrmRepository: Repository<UserModel>;
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
                    entities: [UserModel],
                    synchronize: true,
                    dropSchema: true,
                }),
                TypeOrmModule.forFeature([UserModel]),
            ],
            providers: [
                PostgresUserDao,
                UserRepository,
                TestDatabaseHelper,
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
        dbHelper = module.get<TestDatabaseHelper>(TestDatabaseHelper);
        typeOrmRepository = module.get<Repository<UserModel>>(
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

    describe('save() y findById()', () => {
        it('debería guardar un usuario en la BD y recuperarlo mapeado al dominio', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;

            // Act
            const savedUser = await repository.save(domainUser);
            const foundUser = await repository.findById(savedUser.id);

            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser?.id).toBe(domainUser.id);
            expect(foundUser?.email).toBe(domainUser.email);

            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });
            expect(dbRecord).toBeDefined();
            expect(dbRecord?.email).toBe(domainUser.email);
        });

        it('NO debería recuperar el usuario si su estado es DELETED (Lógica del DAO)', async () => {
            // Arrange
            const domainUser = createUserFixture({
                status: UserStatus.DELETED,
            }) as unknown as User;
            await repository.save(domainUser);

            // Act
            const foundUser = await repository.findById(
                domainUser.id,
            );

            expect(foundUser).toBeNull();
        });

        it('NO debería encontrar un usuario si su estado es BANNED', async () => {
            // Arrange
            const bannedUser = createUserFixture({
                status: UserStatus.BANNED,
            }) as unknown as User;
            await repository.save(bannedUser);

            // Act
            const foundById = await repository.findById(
                bannedUser.id,
            );
            const foundByEmail = await repository.findByEmail(
                bannedUser.email,
            );

            // Assert
            expect(foundById).toBeNull();
            expect(foundByEmail).toBeNull();
        });
    });

    describe('save() - Errores de Restricción', () => {
        it('debería lanzar un error si se intenta guardar un email ya existente (Unique Constraint)', async () => {
            // Arrange
            const user1 = createUserFixture({
                id: '11111111-1111-1111-1111-111111111111',
                email: 'repetido@test.com',
            }) as unknown as User;

            const user2 = createUserFixture({
                id: '22222222-2222-2222-2222-222222222222',
                email: 'repetido@test.com',
            }) as unknown as User;

            await repository.save(user1);

            // Act & Assert
            await expect(repository.save(user2)).rejects.toThrow();
        });

        it('debería fallar si el nombre excede los 100 caracteres', async () => {
            // Arrange
            const userConNombreLargo = createUserFixture({
                fullName: 'A'.repeat(101),
            }) as unknown as User;

            // Act
            const result = repository.save(userConNombreLargo);

            // Assert
            await expect(result).rejects.toThrow();
        });

        it('debería fallar si se intenta guardar un status inválido (Violación de CHECK)', async () => {
            // Arrange
            const userBadStatus =
                createUserFixture() as unknown as User;
            (userBadStatus as any).status = 'INVALID_STATUS';

            // Act
            const result = repository.save(userBadStatus);

            // Assert
            await expect(result).rejects.toThrow();
        });
    });

    describe('findByEmail() y existsByEmail()', () => {
        it('debería retornar true y el usuario si el email existe', async () => {
            // Arrange
            const domainUser = createUserFixture({
                email: 'unico@test.com',
            }) as unknown as User;
            await repository.save(domainUser);

            // Act
            const exists =
                await repository.existsByEmail('unico@test.com');
            const foundUser =
                await repository.findByEmail('unico@test.com');

            // Assert
            expect(exists).toBe(true);
            expect(foundUser).toBeDefined();
            expect(foundUser?.id).toBe(domainUser.id);
        });

        it('debería retornar false y null si el email no existe', async () => {
            // Act
            const exists = await repository.existsByEmail(
                'no-existe@test.com',
            );
            const foundUser = await repository.findByEmail(
                'no-existe@test.com',
            );

            // Assert
            expect(exists).toBe(false);
            expect(foundUser).toBeNull();
        });
    });

    describe('update()', () => {
        it('debería actualizar los roles transformando el Set de dominio a un Array de persistencia', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;
            domainUser.roles = new Set([Role.CLIENT]);
            await repository.save(domainUser);

            const nuevosRoles = new Set([Role.CLIENT, Role.ADMIN]);
            domainUser.fullName = 'Nombre Actualizado';
            domainUser.roles = nuevosRoles;

            // Act
            const updatedUser = await repository.update(domainUser);

            // Assert
            expect(updatedUser.fullName).toBe('Nombre Actualizado');
            expect(updatedUser.roles).toBeInstanceOf(Set);
            expect(updatedUser.roles).toEqual(nuevosRoles);
            expect(updatedUser.roles.size).toBe(2);

            // Assert
            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });

            expect(Array.isArray(dbRecord?.roles)).toBe(true);
            expect(dbRecord?.roles).toEqual(
                expect.arrayContaining([Role.CLIENT, Role.ADMIN]),
            );
            expect(dbRecord?.roles).toHaveLength(2);
        });

        it('debería persistir correctamente un Set con elementos duplicados como un Array único', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;
            await repository.save(domainUser);

            domainUser.roles = new Set([
                Role.CLIENT,
                Role.CLIENT,
                Role.OWNER,
            ]);

            // Act

            await repository.update(domainUser);

            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });

            // Assert
            expect(dbRecord?.roles).toHaveLength(2);
            expect(dbRecord?.roles).toEqual([
                Role.CLIENT,
                Role.OWNER,
            ]);
        });
    });

    describe('delete()', () => {
        it('debería eliminar el registro físicamente de la base de datos', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;
            await repository.save(domainUser);

            // Act
            const isDeleted = await repository.delete(domainUser.id);

            // Assert
            expect(isDeleted).toBe(true);

            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });
            expect(dbRecord).toBeNull();
        });

        it('debería retornar false si se intenta eliminar un ID que no existe', async () => {
            // Act
            const result = await repository.delete(
                '00000000-0000-0000-0000-000000000000',
            );

            // Assert
            expect(result).toBe(false);
        });
    });
});
