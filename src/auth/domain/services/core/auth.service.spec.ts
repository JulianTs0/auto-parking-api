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
import { toMockEntity } from 'test/utils/entity-mocks.utils';
import { createMockAuthHelper } from 'test/utils/test-mocks.utils';

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

    beforeAll(async () => {
        const mockAuthHelper = createMockAuthHelper();

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
        it('should throw UNAUTHORIZED when token is invalid', async () => {
            // Arrange
            authHelperMock.parseToken.mockResolvedValue(null);

            // Act
            const result = service.validateToken('invalid-token');

            // Assert - should throw UNAUTHORIZED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.UNAUTHORIZED),
            );
        });

        it('should throw USER_DELETED when user is deleted', async () => {
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

            // Assert - should throw USER_DELETED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_DELETED),
            );
        });

        it('should return user when token is valid', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture());
            authHelperMock.parseToken.mockResolvedValue(
                'valid-token',
            );
            authHelperMock.getSubject.mockResolvedValue(mockUser.id);
            userServiceMock.findUserById.mockResolvedValue(mockUser);

            // Act
            const result = await service.validateToken('raw-token');

            // Assert - should return the user
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

        it('should throw INVALID_PASSWORD when password is incorrect', async () => {
            // Arrange
            const mockUser = toMockEntity(createUserFixture());
            const loginDto = createLoginDtoFixture();

            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            authHelperMock.validatePassword.mockResolvedValue(false);

            // Act
            const result = service.login(loginDto as any);

            // Assert - should throw INVALID_PASSWORD error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.INVALID_PASSWORD),
            );
        });

        it('should update timestamp, generate token and return response on successful login', async () => {
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

            // Assert - user updatedAt should be updated
            expect(mockUser.updatedAt).toEqual(
                new Date('2025-01-01'),
            );
            // Assert - updateUser should be called
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
            // Assert - createToken should be called
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            // Assert - should return defined result
            expect(result).toBeDefined();

            jest.useRealTimers();
        });

        it('should throw USER_DELETED when user is deleted', async () => {
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

            // Assert - should throw USER_DELETED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_DELETED),
            );
        });

        it('should throw USER_NOT_ACTIVATED when user is inactive', async () => {
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

            // Assert - should throw USER_NOT_ACTIVATED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_ACTIVATED),
            );
        });
    });

    describe('buildUser()', () => {
        it('should build User entity with initial data and hashed password', async () => {
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

            // Assert - should generate UUID
            expect(result.id).toBe(generatedUuid);
            // Assert - should hash password
            expect(result.passwordHash).toBe('hashed-pass');
            // Assert - should set fullName
            expect(result.fullName).toBe(registerDto.fullName);
            // Assert - should set email
            expect(result.email).toBe(registerDto.email);
            // Assert - should set status to INACTIVE
            expect(result.status).toBe(UserStatus.INACTIVE);
        });
    });

    describe('resendVerifyEmail()', () => {
        it('should throw USER_ALREADY_ACTIVATED when user is already active', async () => {
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

            // Assert - should throw USER_ALREADY_ACTIVATED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_ALREADY_ACTIVATED),
            );
        });

        it('should generate token and emit REGISTER event (happy path)', async () => {
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

            // Assert - createToken should be called with user
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            // Assert - should emit REGISTER event
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
        it('should change status to ACTIVE and update user when token is valid', async () => {
            // Arrange
            // Inactive user fixture
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

            // Assert - user status should be ACTIVE
            expect(mockUser.status).toBe(UserStatus.ACTIVE);
            // Assert - updateUser should be called
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
        });

        it('should throw UNAUTHORIZED when token is invalid or null', async () => {
            // Arrange
            authHelperMock.parseToken.mockResolvedValue(null);
            const request = {
                token: 'invalid-token',
            } as VerifyEmailReq;

            // Act
            const result = service.verifyEmail(request);

            // Assert - should throw UNAUTHORIZED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.UNAUTHORIZED),
            );
        });

        it('should throw USER_NOT_FOUND when user does not exist', async () => {
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

            // Assert - should throw USER_NOT_FOUND error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('should throw USER_ALREADY_ACTIVATED when user is already active', async () => {
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

            // Assert - should throw USER_ALREADY_ACTIVATED error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_ALREADY_ACTIVATED),
            );
        });

        it('should change status to ACTIVE and update user (happy path)', async () => {
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

            // Assert - user status should be ACTIVE
            expect(mockUser.status).toBe(UserStatus.ACTIVE);
            // Assert - updateUser should be called
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
        });
    });

    describe('recoverPassword()', () => {
        it('should throw USER_NOT_FOUND when user does not exist or is not active', async () => {
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

            // Assert - should throw USER_NOT_FOUND error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('should create token and emit RECOVER_PASSWORD event (happy path)', async () => {
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

            // Assert - createToken should be called with user
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            // Assert - should emit RECOVER_PASSWORD event
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
        it('should hash new password and update user', async () => {
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

            // Assert - hashPassword should be called with new password
            expect(authHelperMock.hashPassword).toHaveBeenCalledWith(
                'MiNuevaPassword123',
            );
            // Assert - user passwordHash should be updated
            expect(mockUser.passwordHash).toBe('new-hashed-pass');
            // Assert - updateUser should be called
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                mockUser,
            );
        });
    });
});
