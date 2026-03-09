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

describe('AuthCoreController', () => {
    let controller: AuthCoreController;
    let authServiceMock: jest.Mocked<AuthServiceI>;

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
        it('debería delegar al servicio y retornar AuthRes', async () => {
            // Arrange
            const request = {
                authorization: 'Bearer token-123',
            } as AuthReq;

            const expectedResponse = createAuthResFixture();

            authServiceMock.auth.mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.auth(request);

            // Assert
            expect(authServiceMock.auth).toHaveBeenCalledWith(
                request,
            );
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('login()', () => {
        it('debería delegar al servicio y retornar LoginRes', async () => {
            // Arrange
            const request = createLoginDtoFixture() as LoginReq;
            const expectedResponse = createLoginResFixture();

            authServiceMock.login.mockResolvedValue(expectedResponse);
            authServiceMock.login.mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.login(request);

            // Assert
            expect(authServiceMock.login).toHaveBeenCalledWith(
                request,
            );
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('verifyEmail()', () => {
        it('debería delegar al servicio sin retornar nada', async () => {
            // Arrange
            const request = {
                token: 'verify-token-123',
            } as VerifyEmailReq;
            authServiceMock.verifyEmail.mockResolvedValue(undefined);

            // Act
            const result = await controller.verifyEmail(request);

            // Assert
            expect(authServiceMock.verifyEmail).toHaveBeenCalledWith(
                request,
            );
            expect(result).toBeUndefined();
        });
    });

    describe('changePassword()', () => {
        it('debería mapear los datos, delegar al servicio y no retornar nada', async () => {
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

            // Assert
            expect(
                authServiceMock.changePassword,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toBeUndefined();
        });
    });

    describe('recoverPassword()', () => {
        it('debería delegar al servicio sin retornar nada', async () => {
            // Arrange
            const request = {
                email: 'test@test.com',
            } as RecoverPasswordReq;
            authServiceMock.recoverPassword.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.recoverPassword(request);

            // Assert
            expect(
                authServiceMock.recoverPassword,
            ).toHaveBeenCalledWith(request);
            expect(result).toBeUndefined();
        });
    });

    describe('resendEmail()', () => {
        it('debería delegar al servicio sin retornar nada', async () => {
            // Arrange
            const request = {
                email: 'test@test.com',
            } as ResendEmailReq;
            authServiceMock.resendVerifyEmail.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.resendEmail(request);

            // Assert
            expect(
                authServiceMock.resendVerifyEmail,
            ).toHaveBeenCalledWith(request);
            expect(result).toBeUndefined();
        });
    });
});
