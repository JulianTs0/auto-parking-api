import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service'; // Ajustá la ruta
import { UserRepositoryI } from '../../repository/user-repository.interface';
import { AuthHelper } from '../../../../auth/config/helpers/auth.helper';
import { Errors, ServiceError, User, UserStatus } from 'src/commons';
import { DeleteReq } from '../../dto/users/request/delete.request.dto';
import { EditReq } from '../../dto/users/request/edit.request.dto';
import { GetByIdReq } from '../../dto/users/request/get-by-id.request.dto';
import {
    createUpdateUserDtoFixture,
    createUserListFixture,
} from 'test/fixtures';

jest.mock('@nestjs-cls/transactional', () => ({
    Transactional: () => {
        return (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
        ) => {
            return descriptor;
        };
    },
}));

describe('UserService', () => {
    let service: UserService;
    let repositoryMock: jest.Mocked<UserRepositoryI>;
    let authHelperMock: jest.Mocked<AuthHelper>;

    beforeAll(async () => {
        const mockRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            existsByEmail: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        };

        const mockAuthHelper = {
            validatePassword: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepositoryI,
                    useValue: mockRepository,
                },
                { provide: AuthHelper, useValue: mockAuthHelper },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        repositoryMock = module.get(UserRepositoryI);
        authHelperMock = module.get(AuthHelper);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('UserServiceI (Public API)', () => {
        describe('getById()', () => {
            it('debería lanzar USER_NOT_FOUND si el usuario no existe', async () => {
                // Arrange
                repositoryMock.findById.mockResolvedValue(null);
                const req = { id: 'uuid-invalido' } as GetByIdReq;

                // Act
                const result = service.getById(req);

                // Assert
                await expect(result).rejects.toThrow(
                    new ServiceError(Errors.USER_NOT_FOUND),
                );
            });

            it('debería retornar el usuario mapeado si existe', async () => {
                // Arrange
                const mockUser =
                    createUserListFixture()[0] as unknown as User;
                repositoryMock.findById.mockResolvedValue(mockUser);
                const req = { id: mockUser.id } as GetByIdReq;

                // Act
                const result = await service.getById(req);

                // Assert
                expect(repositoryMock.findById).toHaveBeenCalledWith(
                    mockUser.id,
                );
                expect(result).toBeDefined();
            });
        });

        describe('delete()', () => {
            it('debería banear al usuario si el authUser es ADMIN', async () => {
                // Arrange
                const targetUser =
                    createUserListFixture()[0] as unknown as User;
                repositoryMock.findById.mockResolvedValue(targetUser);

                const req = {
                    id: targetUser.id,
                    authUser: { isAdmin: () => true },
                } as unknown as DeleteReq;

                // Act
                await service.delete(req);

                // Assert
                expect(targetUser.status).toBe(UserStatus.BANNED);
                expect(repositoryMock.update).toHaveBeenCalledWith(
                    targetUser,
                );
            });

            it('debería lanzar FORBIDDEN si soy yo mismo pero la password es inválida', async () => {
                // Arrange
                const myUser =
                    createUserListFixture()[0] as unknown as User;
                repositoryMock.findById.mockResolvedValue(myUser);
                authHelperMock.validatePassword.mockResolvedValue(
                    false,
                );

                const req = {
                    id: myUser.id,
                    authUser: { id: myUser.id, isAdmin: () => false },
                    body: { password: 'wrong-password' },
                } as unknown as DeleteReq;

                // Act

                const result = service.delete(req);

                // Assert

                await expect(result).rejects.toThrow(
                    new ServiceError(Errors.FORBIDDEN),
                );
            });

            it('debería marcar como DELETED si soy yo mismo y la password es válida', async () => {
                // Arrange
                const myUser =
                    createUserListFixture()[0] as unknown as User;
                repositoryMock.findById.mockResolvedValue(myUser);
                authHelperMock.validatePassword.mockResolvedValue(
                    true,
                );

                const req = {
                    id: myUser.id,
                    authUser: { id: myUser.id, isAdmin: () => false },
                    body: { password: 'correct-password' },
                } as unknown as DeleteReq;

                // Act

                await service.delete(req);

                // Assert

                expect(myUser.status).toBe(UserStatus.DELETED);
                expect(repositoryMock.update).toHaveBeenCalledWith(
                    myUser,
                );
            });

            it('debería lanzar FORBIDDEN si no soy Admin y quiero borrar a otro', async () => {
                // Arrange
                const users =
                    createUserListFixture() as unknown as User[];
                const targetUser = users[0];
                const hackerUser = users[1];

                repositoryMock.findById.mockResolvedValue(targetUser);

                const req = {
                    id: targetUser.id,
                    authUser: {
                        id: hackerUser.id,
                        isAdmin: () => false,
                    },
                } as unknown as DeleteReq;

                // Act

                const result = service.delete(req);

                await expect(result).rejects.toThrow(
                    new ServiceError(Errors.FORBIDDEN),
                );
            });
        });

        describe('edit()', () => {
            it('debería actualizar los datos si soy el dueño y el usuario existe', async () => {
                // Arrange
                const myUser =
                    createUserListFixture()[0] as unknown as User;
                const updateData = createUpdateUserDtoFixture();

                repositoryMock.findById.mockResolvedValue(myUser);
                repositoryMock.update.mockResolvedValue({
                    ...myUser,
                    fullName: updateData.fullName,
                    phoneNumber: updateData.phoneNumber,
                } as User);

                const req = {
                    id: myUser.id,
                    authUser: { id: myUser.id },
                    body: updateData,
                } as unknown as EditReq;

                // Act
                await service.edit(req);

                // Assert
                expect(myUser.fullName).toBe(updateData.fullName);
                expect(myUser.phoneNumber).toBe(
                    updateData.phoneNumber,
                );
                expect(repositoryMock.update).toHaveBeenCalledWith(
                    myUser,
                );
            });
        });
    });
});
