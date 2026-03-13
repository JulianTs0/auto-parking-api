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
        it('should return true and attach user to request if token is valid', async () => {
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

            // Assert - should return true
            expect(result).toBe(true);
            // Assert - validateToken should be called with token
            expect(
                mockAuthService.validateToken,
            ).toHaveBeenCalledWith(mockToken);
            // Assert - user should be attached to request
            expect(mockRequest['user']).toEqual(mockUser);
        });

        it('should throw ServiceError(UNAUTHORIZED) if no header', async () => {
            // Arrange
            const context = createMockExecutionContext({
                headers: {},
            });

            // Act & Assert - should throw UNAUTHORIZED error
            await expect(guard.canActivate(context)).rejects.toThrow(
                new ServiceError(Errors.UNAUTHORIZED),
            );
            // Assert - validateToken should not be called
            expect(
                mockAuthService.validateToken,
            ).not.toHaveBeenCalled();
        });
    });
});
