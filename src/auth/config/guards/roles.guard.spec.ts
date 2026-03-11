import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard'; // Ajustá la ruta
import { Errors, Role, ServiceError } from 'src/commons';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflectorMock: jest.Mocked<Reflector>;

    const createMockContext = (mockUser?: any): ExecutionContext => {
        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => ({
                    user: mockUser,
                }),
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
        const mockReflector = {
            getAllAndOverride: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: mockReflector,
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflectorMock = module.get(Reflector);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate()', () => {
        it('should return true if route does not require roles', () => {
            // Arrange
            const context = createMockContext();

            reflectorMock.getAllAndOverride.mockReturnValue(
                undefined,
            );

            // Act
            const result = guard.canActivate(context);

            // Assert - should return true
            expect(result).toBe(true);
            // Assert - getAllAndOverride should be called
            expect(
                reflectorMock.getAllAndOverride,
            ).toHaveBeenCalled();
        });

        it('should throw ServiceError(FORBIDDEN) if user does not have the role', () => {
            // Arrange
            const mockUser = { roles: new Set([Role.EMPLOYEE]) };
            const context = createMockContext(mockUser);

            reflectorMock.getAllAndOverride.mockReturnValue([
                Role.ADMIN,
            ]);

            // Act & Assert - should throw FORBIDDEN error
            expect(() => guard.canActivate(context)).toThrow(
                new ServiceError(Errors.FORBIDDEN),
            );
        });

        it('should return true if user has at least one required role', () => {
            // Arrange
            const mockUser = { roles: new Set([Role.ADMIN]) };
            const context = createMockContext(mockUser);

            reflectorMock.getAllAndOverride.mockReturnValue([
                Role.ADMIN,
            ]);

            // Act
            const result = guard.canActivate(context);

            // Assert - should return true
            expect(result).toBe(true);
        });
    });
});
