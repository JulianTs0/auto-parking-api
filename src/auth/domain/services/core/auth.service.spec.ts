import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { UserInternalServiceI } from '../../../../users/domain/services/core/user-service.interface';
import { EventPublisherI } from '../../../../app-events/services/event-publisher.interface';
import { Errors } from '../../../../commons/error/error-type.constants';
import { IdGenerator } from '../../../../commons/config/id-generator.util';
import { ServiceError } from '../../../../commons/error/service.error';
import { Token } from '../../../../commons/dto/token.dto';
import { User } from '../../../../commons/entity/user.entity';
import { UserStatus } from '../../../../commons/const/user-status.enum';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { ResendEmailReq } from '../../dto/auth/request/resend-email.request.dto';
import { VerifyEmailReq } from '../../dto/auth/request/verify-email.request.dto';
import { EditPasswordReq } from '../../dto/auth/request/edit-password.request.dto';
import {
    createCreateUserDtoFixture,
    createLoginDtoFixture,
} from 'test/fixtures/auth.fixtures';
import { createUserFixture } from 'test/fixtures/auth.fixtures';
import { LoginReq } from '../../dto/auth/request/login.request.dto';
import { AuthEvents } from '../../../config/utils/auth-events.enum';
import { RecoverPasswordReq } from '../../dto/auth/request/recover-password.request.dto';

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

describe('AuthService', () => {
    let service: AuthService;
    let authHelperMock: jest.Mocked<AuthHelper>;
    let userServiceMock: jest.Mocked<UserInternalServiceI>;
    let eventPublisherMock: jest.Mocked<EventPublisherI>;

    const toMockEntity = (
        fixtureData: any,
        methodOverrides = {},
    ): User =>
        ({
            ...fixtureData,
            isDeleted: jest.fn().mockReturnValue(false),
            isInactive: jest.fn().mockReturnValue(false),
            isActive: jest.fn().mockReturnValue(true),
            ...methodOverrides,
        }) as unknown as User;

    beforeAll(async () => {
        const mockAuthHelper = {
            parseToken: jest.fn(),
            getSubject: jest.fn(),
            validatePassword: jest.fn(),
            createToken: jest.fn(),
            hashPassword: jest.fn(),
        };

        const mockUserService = {
            findUserById: jest.fn(),
            findUserByEmail: jest.fn(),
            updateUser: jest.fn(),
        };

        const mockEventPublisher = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: AuthHelper,
                    useValue: mockAuthHelper,
                },
                {
                    provide: UserInternalServiceI,
                    useValue: mockUserService,
                },
                {
                    provide: EventPublisherI,
                    useValue: mockEventPublisher,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        authHelperMock = module.get(AuthHelper);
        userServiceMock = module.get(UserInternalServiceI);
        eventPublisherMock = module.get(EventPublisherI);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateToken()', () => {
        it('debería lanzar UNAUTHORIZED si el token es inválido', async () => {
            // Arrange
            authHelperMock.parseToken.mockResolvedValue(null);

            // Act
            const result = service.validateToken('invalid-token');

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.UNAUTHORIZED),
            );
        });

        it('debería lanzar USER_DELETED si el usuario está borrado', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture(), {
                isDeleted: jest.fn().mockReturnValue(true),
            });
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue(mockUser.id);
            userServiceMock.findUserById.mockResolvedValue(mockUser);

            // Act
            const result = service.validateToken('raw-token');

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_DELETED),
            );
        });

        it('debería retornar el usuario si todo es válido', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture());
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue(mockUser.id);
            userServiceMock.findUserById.mockResolvedValue(mockUser);

            // Act
            const result = await service.validateToken('raw-token');

            // Assert
            expect(result).toEqual(mockUser);
        });
    });

    describe('login()', () => {
        beforeEach(() => {
            jest.useFakeTimers().setSystemTime(
                new Date('2025-01-01'),
            );
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('debería lanzar INVALID_PASSWORD si la clave es incorrecta', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture());
            const loginDto = createLoginDtoFixture();

            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            authHelperMock.validatePassword.mockResolvedValue(false);

            // Act
            const result = service.login(loginDto as any);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.INVALID_PASSWORD),
            );
        });

        it('debería actualizar la fecha, generar un token y retornar el response en login exitoso', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture());
            const loginDto = createLoginDtoFixture();
            const mockToken = { accessToken: 'jwt-123' } as Token;

            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            authHelperMock.validatePassword.mockResolvedValue(true);
            userServiceMock.updateUser.mockResolvedValue(mockUser);
            authHelperMock.createToken.mockResolvedValue(mockToken);

            // Act
            const result = await service.login(loginDto as any);

            // Assert
            expect(mockUser.updatedAt).toEqual(
                new Date('2025-01-01'),
            );
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            expect(result).toBeDefined();

            jest.useRealTimers();
        });

        it('debería lanzar USER_DELETED si el usuario está borrado', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture(), {
                isDeleted: jest.fn().mockReturnValue(true),
            });
            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            const request = {
                email: 'test@example.com',
                password: '123',
            } as LoginReq;

            // Act
            const result = service.login(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_DELETED),
            );
        });

        it('debería lanzar USER_NOT_ACTIVATED si el usuario está inactivo', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture(), {
                isInactive: jest.fn().mockReturnValue(true),
            });
            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            const request = {
                email: 'test@example.com',
                password: '123',
            } as LoginReq;

            // Act
            const result = service.login(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_ACTIVATED),
            );
        });
    });

    describe('buildUser()', () => {
        it('debería construir una entidad User con los datos iniciales y password hasheado', async () => {
            // Arrange
            const generatedUuid = 'fake-uuid-123';
            jest.spyOn(IdGenerator, 'generateUUID').mockReturnValue(
                generatedUuid,
            );
            authHelperMock.hashPassword.mockResolvedValue(
                'hashed-pass',
            );

            const registerDto = createCreateUserDtoFixture();

            // Act
            const result = await service.buildUser(
                registerDto as RegisterReq,
            );

            // Assert
            expect(result.id).toBe(generatedUuid);
            expect(result.passwordHash).toBe('hashed-pass');
            expect(result.fullName).toBe(registerDto.fullName);
            expect(result.email).toBe(registerDto.email);
            expect(result.status).toBe(UserStatus.INACTIVE);
        });
    });

    describe('resendVerifyEmail()', () => {
        it('debería lanzar USER_ALREADY_ACTIVATED si el usuario ya está activo', async () => {
            // Arrange
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.ACTIVE }),
                {
                    isActive: jest.fn().mockReturnValue(true),
                },
            );
            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            const request = {
                email: mockUser.email,
            } as ResendEmailReq;

            // Act
            const result = service.resendVerifyEmail(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_ALREADY_ACTIVATED),
            );
        });

        it('debería generar el token y emitir el evento REGISTER (Camino feliz)', async () => {
            // Arrange
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.INACTIVE }),
                { isActive: jest.fn().mockReturnValue(false) },
            );
            const mockToken = { accessToken: 'jwt-xyz' } as Token;

            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            authHelperMock.createToken.mockResolvedValue(mockToken);

            const request = {
                email: mockUser.email,
            } as ResendEmailReq;

            // Act
            await service.resendVerifyEmail(request);

            // Assert
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.REGISTER,
                {
                    user: mockUser,
                    token: mockToken,
                },
            );
        });
    });

    describe('verifyEmail()', () => {
        it('debería cambiar el status a ACTIVE y actualizar el usuario si el token es válido', async () => {
            // Arrange
            // Fixture inactivo
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.INACTIVE }),
            );
            authHelperMock.parseToken.mockResolvedValue(
                'clean-token',
            );
            authHelperMock.getSubject.mockResolvedValue(mockUser.id);
            userServiceMock.findUserById.mockResolvedValue(mockUser);

            const request = { token: 'raw-token' } as VerifyEmailReq;

            // Act
            await service.verifyEmail(request);

            // Assert
            expect(mockUser.status).toBe(UserStatus.ACTIVE);
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
        });

        it('debería lanzar UNAUTHORIZED si el token no es válido o es nulo', async () => {
            // Arrange
            authHelperMock.parseToken.mockResolvedValue(null);
            const request = {
                token: 'invalid-token',
            } as VerifyEmailReq;

            // Act
            const result = service.verifyEmail(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.UNAUTHORIZED),
            );
        });

        it('debería lanzar USER_NOT_FOUND si el usuario no existe', async () => {
            // Arrange
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue('uuid-123');
            userServiceMock.findUserById.mockResolvedValue(null);
            const request = {
                token: 'valid-token',
            } as VerifyEmailReq;

            // Act
            const result = service.verifyEmail(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('debería lanzar USER_ALREADY_ACTIVATED si el usuario ya está activo', async () => {
            // Arrange
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.ACTIVE }),
            );
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue(mockUser.id);
            userServiceMock.findUserById.mockResolvedValue(mockUser);
            const request = {
                token: 'valid-token',
            } as VerifyEmailReq;

            // Act
            const result = service.verifyEmail(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_ALREADY_ACTIVATED),
            );
        });

        it('debería cambiar el status a ACTIVE y actualizar el usuario (Camino feliz)', async () => {
            // Arrange
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.INACTIVE }),
            );
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue(mockUser.id);
            userServiceMock.findUserById.mockResolvedValue(mockUser);
            const request = {
                token: 'valid-token',
            } as VerifyEmailReq;

            // Act
            await service.verifyEmail(request);

            // Assert
            expect(mockUser.status).toBe(UserStatus.ACTIVE);
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
        });
    });

    describe('recoverPassword()', () => {
        it('debería lanzar USER_NOT_FOUND si el usuario no existe o no está activo', async () => {
            // Arrange
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.INACTIVE }),
            );
            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            const request = {
                email: 'inactivo@example.com',
            } as RecoverPasswordReq;

            // Act
            const result = service.recoverPassword(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('debería crear el token y emitir el evento RECOVER_PASSWORD (Camino feliz)', async () => {
            // Arrange
            const mockUser = toMockEntity(
                createUserFixture({ status: UserStatus.ACTIVE }),
            );
            const mockToken = { accessToken: 'recover-jwt' } as Token;

            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            authHelperMock.createToken.mockResolvedValue(mockToken);

            const request = {
                email: mockUser.email,
            } as RecoverPasswordReq;

            // Act
            await service.recoverPassword(request);

            // Assert
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.RECOVER_PASSWORD,
                {
                    user: mockUser,
                    token: mockToken,
                },
            );
        });
    });

    describe('changePassword()', () => {
        it('debería hashear la nueva clave y actualizar el usuario', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture());
            authHelperMock.hashPassword.mockResolvedValue(
                'new-hashed-pass',
            );

            const request = {
                authUser: mockUser,
                body: { newPassword: 'MiNuevaPassword123' },
            } as EditPasswordReq;

            // Act
            await service.changePassword(request);

            // Assert
            expect(authHelperMock.hashPassword).toHaveBeenCalledWith(
                'MiNuevaPassword123',
            );
            expect(mockUser.passwordHash).toBe('new-hashed-pass');
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
        });
    });
});
