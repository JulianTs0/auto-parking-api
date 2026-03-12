import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Role, User, UserStatus } from 'src/commons';
import { UserRepository } from 'src/users/persistance/repository/user.repository';
import { UserModel } from 'src/users/persistance/datasource/data/postgres/models/user.model';
import { TestDatabaseHelper } from '../../utils/test-database.helper';
import { PostgresUserDao } from 'src/users/persistance/datasource/data/postgres/dao/postgres-user.dao';
import { createUserFixture } from '../../fixtures/auth.fixtures';
import { createIntegrationModuleConfig } from '../../utils/integration-module.utils';
import { Repository } from 'typeorm';

describe('UserRepository (Integration)', () => {
    let repository: UserRepository;
    let dbHelper: TestDatabaseHelper;
    let typeOrmRepository: Repository<UserModel>;
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                ...createIntegrationModuleConfig([UserModel]).imports,
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

    describe('save() and findById()', () => {
        it('should save user in DB and recover it mapped to domain', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;

            // Act
            const savedUser = await repository.save(domainUser);
            const foundUser = await repository.findById(savedUser.id);

            // Assert - foundUser should be defined
            expect(foundUser).toBeDefined();
            // Assert - should have correct id
            expect(foundUser?.id).toBe(domainUser.id);
            // Assert - should have correct email
            expect(foundUser?.email).toBe(domainUser.email);

            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });
            expect(dbRecord).toBeDefined();
            expect(dbRecord?.email).toBe(domainUser.email);
        });

        it('should NOT recover user if status is DELETED (DAO Logic)', async () => {
            // Arrange
            const domainUser = createUserFixture({
                status: UserStatus.DELETED,
            }) as unknown as User;
            await repository.save(domainUser);

            // Act
            const foundUser = await repository.findById(
                domainUser.id,
            );

            // Assert - should return null
            expect(foundUser).toBeNull();
        });

        it('should NOT find user if status is BANNED', async () => {
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

            // Assert - both should be null
            expect(foundById).toBeNull();
            expect(foundByEmail).toBeNull();
        });
    });

    describe('save() - Constraint Errors', () => {
        it('should throw error if trying to save existing email (Unique Constraint)', async () => {
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

            // Act & Assert - should throw error
            await expect(repository.save(user2)).rejects.toThrow();
        });

        it('should fail if name exceeds 100 characters', async () => {
            // Arrange
            const userConNombreLargo = createUserFixture({
                fullName: 'A'.repeat(101),
            }) as unknown as User;

            // Act
            const result = repository.save(userConNombreLargo);

            // Assert - should throw error
            await expect(result).rejects.toThrow();
        });

        it('should fail if trying to save invalid status (CHECK Violation)', async () => {
            // Arrange
            const userBadStatus =
                createUserFixture() as unknown as User;
            (userBadStatus as any).status = 'INVALID_STATUS';

            // Act
            const result = repository.save(userBadStatus);

            // Assert - should throw error
            await expect(result).rejects.toThrow();
        });
    });

    describe('findByEmail() and existsByEmail()', () => {
        it('should return true and user if email exists', async () => {
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

            // Assert - exists should be true
            expect(exists).toBe(true);
            // Assert - foundUser should be defined
            expect(foundUser).toBeDefined();
            // Assert - should have correct id
            expect(foundUser?.id).toBe(domainUser.id);
        });

        it('should return false and null if email does not exist', async () => {
            // Act
            const exists = await repository.existsByEmail(
                'no-existe@test.com',
            );
            const foundUser = await repository.findByEmail(
                'no-existe@test.com',
            );

            // Assert - exists should be false
            expect(exists).toBe(false);
            // Assert - foundUser should be null
            expect(foundUser).toBeNull();
        });
    });

    describe('update()', () => {
        it('should update roles transforming domain Set to persistence Array', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;
            domainUser.roles = new Set([Role.CLIENT]);
            await repository.save(domainUser);

            const nuevosRoles = new Set([Role.CLIENT, Role.ADMIN]);
            domainUser.fullName = 'Nombre Actualizado';
            domainUser.roles = nuevosRoles;

            // Act
            const updatedUser = await repository.update(domainUser);

            // Assert - fullName should be updated
            expect(updatedUser.fullName).toBe('Nombre Actualizado');
            // Assert - roles should be Set
            expect(updatedUser.roles).toBeInstanceOf(Set);
            // Assert - roles should equal nuevosRoles
            expect(updatedUser.roles).toEqual(nuevosRoles);
            // Assert - roles size should be 2
            expect(updatedUser.roles.size).toBe(2);

            // Assert - check database record
            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });

            expect(Array.isArray(dbRecord?.roles)).toBe(true);
            expect(dbRecord?.roles).toEqual(
                expect.arrayContaining([Role.CLIENT, Role.ADMIN]),
            );
            expect(dbRecord?.roles).toHaveLength(2);
        });

        it('should correctly persist Set with duplicate elements as unique Array', async () => {
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

            // Assert - should have 2 unique roles
            expect(dbRecord?.roles).toHaveLength(2);
            expect(dbRecord?.roles).toEqual([
                Role.CLIENT,
                Role.OWNER,
            ]);
        });
    });

    describe('delete()', () => {
        it('should physically delete record from database', async () => {
            // Arrange
            const domainUser = createUserFixture() as unknown as User;
            await repository.save(domainUser);

            // Act
            const isDeleted = await repository.delete(domainUser.id);

            // Assert - should return true
            expect(isDeleted).toBe(true);

            const dbRecord = await typeOrmRepository.findOneBy({
                id: domainUser.id,
            });
            expect(dbRecord).toBeNull();
        });

        it('should return false if attempting to delete non-existent ID', async () => {
            // Act
            const result = await repository.delete(
                '00000000-0000-0000-0000-000000000000',
            );

            // Assert - should return false
            expect(result).toBe(false);
        });
    });
});
