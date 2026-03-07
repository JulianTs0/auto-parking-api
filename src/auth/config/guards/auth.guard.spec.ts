import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { AuthServiceI } from 'src/auth/domain/services/core/auth-service.interface';
import { ExecutionContext } from '@nestjs/common';
import { Errors, ServiceError, User } from 'src/commons';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let mockAuthService: AuthServiceI;

    const createMockExecutionContext = (
        mockRequest: any,
    ): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => mockRequest,
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const authServiceTemplateMock = {
            validateToken: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: AuthServiceI,
                    useValue: authServiceTemplateMock,
                },
            ],
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
        mockAuthService = module.get(AuthServiceI);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate()', () => {
        it('debería retornar true y adjuntar el usuario a la request si el token es válido', async () => {
            // Arrange
            const mockToken = 'Bearer valid-token';
            const mockUser = {
                id: '1',
                email: 'juan@test.com',
            } as User;
            const mockRequest: any = {
                headers: { authorization: mockToken },
            };

            const context = createMockExecutionContext(mockRequest);

            jest.spyOn(
                mockAuthService,
                'validateToken',
            ).mockResolvedValue(mockUser);

            // Act
            const result = await guard.canActivate(context);

            // Assert
            expect(result).toBe(true);
            expect(
                mockAuthService.validateToken,
            ).toHaveBeenCalledWith(mockToken);
            expect(mockRequest['user']).toEqual(mockUser);
        });

        it('debería lanzar ServiceError(UNAUTHORIZED) si no hay header', async () => {
            // Arrange
            const context = createMockExecutionContext({
                headers: {},
            });

            // Act & Assert
            await expect(guard.canActivate(context)).rejects.toThrow(
                new ServiceError(Errors.UNAUTHORIZED),
            );

            expect(
                mockAuthService.validateToken,
            ).not.toHaveBeenCalled();
        });
    });
});
