import { Test, TestingModule } from '@nestjs/testing';
import { AuthCoreController } from './auth-core.controller';
import { AuthServiceI } from '../../../domain/services/core/auth-service.interface';
import { AuthGuard } from 'src/auth/config/guards/auth.guard';
import { Role, Token, User, UserStatus } from 'src/commons';
import { AuthReq } from '../../../domain/dto/auth/request/auth.request.dto';
import { AuthRes } from '../../../domain/dto/auth/response/auth.response.dto';
import { LoginReq } from '../../../domain/dto/auth/request/login.request.dto';
import { LoginRes } from '../../../domain/dto/auth/response/login.response.dto';
import { VerifyEmailReq } from '../../../domain/dto/auth/request/verify-email.request.dto';
import { EditPasswordBody } from 'src/auth/domain/dto/auth/request/edit-password.body.dto';
import { RecoverPasswordReq } from 'src/auth/domain/dto/auth/request/recover-password.request.dto';
import { ResendEmailReq } from 'src/auth/domain/dto/auth/request/resend-email.request.dto';
import {
    createAuthResFixture,
    createLoginDtoFixture,
    createLoginResFixture,
    createUserFixture,
} from 'test/fixtures';
import { toMockEntity } from 'test/utils/entity-mocks.utils';

describe('AuthCoreController', () => {
    let controller: AuthCoreController;
    let authServiceMock: jest.Mocked<AuthServiceI>;

    beforeEach(async () => {
        const mockAuthService = {
            auth: jest.fn(),
            login: jest.fn(),
            verifyEmail: jest.fn(),
            changePassword: jest.fn(),
            recoverPassword: jest.fn(),
            resendVerifyEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthCoreController],
            providers: [
                {
                    provide: AuthServiceI,
                    useValue: mockAuthService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthCoreController>(
            AuthCoreController,
        );
        authServiceMock = module.get(AuthServiceI);

        jest.clearAllMocks();
    });

    describe('auth()', () => {
        it('should delegate to service and return AuthRes', async () => {
            // Arrange
            const request = {
                authorization: 'Bearer token-123',
            } as AuthReq;

            const expectedResponse = createAuthResFixture();

            authServiceMock.auth.mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.auth(request);

            // Assert - auth should be called with request
            expect(authServiceMock.auth).toHaveBeenCalledWith(
                request,
            );
            // Assert - should return expected response
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('login()', () => {
        it('should delegate to service and return LoginRes', async () => {
            // Arrange
            const request = createLoginDtoFixture() as LoginReq;
            const expectedResponse = createLoginResFixture();

            authServiceMock.login.mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.login(request);

            // Assert - login should be called with request
            expect(authServiceMock.login).toHaveBeenCalledWith(
                request,
            );
            // Assert - should return expected response
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('verifyEmail()', () => {
        it('should delegate to service and return undefined', async () => {
            // Arrange
            const request = {
                token: 'verify-token-123',
            } as VerifyEmailReq;
            authServiceMock.verifyEmail.mockResolvedValue(undefined);

            // Act
            const result = await controller.verifyEmail(request);

            // Assert - verifyEmail should be called with request
            expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(
                request,
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('changePassword()', () => {
        it('should map data, delegate to service and return undefined', async () => {
            // Arrange
            const body = {
                newPassword: 'new-password-123',
            } as EditPasswordBody;
            const authUser = toMockEntity(createUserFixture());
            authServiceMock.changePassword.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.changePassword(
                body,
                authUser,
            );

            // Assert - changePassword should be called with mapped data
            expect(
                authServiceMock.changePassword,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('recoverPassword()', () => {
        it('should delegate to service and return undefined', async () => {
            // Arrange
            const request = {
                email: 'test@test.com',
            } as RecoverPasswordReq;
            authServiceMock.recoverPassword.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.recoverPassword(request);

            // Assert - recoverPassword should be called with request
            expect(
                authServiceMock.recoverPassword,
            ).toHaveBeenCalledWith(request);
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('resendEmail()', () => {
        it('should delegate to service and return undefined', async () => {
            // Arrange
            const request = {
                email: 'test@test.com',
            } as ResendEmailReq;
            authServiceMock.resendVerifyEmail.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.resendEmail(request);

            // Assert - resendVerifyEmail should be called with request
            expect(
                authServiceMock.resendVerifyEmail,
            ).toHaveBeenCalledWith(request);
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });
});
