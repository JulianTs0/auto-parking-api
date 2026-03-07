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
        it('debería retornar true si la ruta no requiere roles', () => {
            // Arrange
            const context = createMockContext();

            reflectorMock.getAllAndOverride.mockReturnValue(
                undefined,
            );

            // Act
            const result = guard.canActivate(context);

            // Assert
            expect(result).toBe(true);
            expect(
                reflectorMock.getAllAndOverride,
            ).toHaveBeenCalled();
        });

        it('debería lanzar ServiceError(FORBIDDEN) si el usuario no tiene el rol', () => {
            // Arrange
            const mockUser = { roles: new Set([Role.EMPLOYEE]) };
            const context = createMockContext(mockUser);

            reflectorMock.getAllAndOverride.mockReturnValue([
                Role.ADMIN,
            ]);

            // Act & Assert
            expect(() => guard.canActivate(context)).toThrow(
                new ServiceError(Errors.FORBIDDEN),
            );
        });

        it('debería retornar true si el usuario tiene al menos un rol requerido', () => {
            // Arrange
            const mockUser = { roles: new Set([Role.ADMIN]) };
            const context = createMockContext(mockUser);

            reflectorMock.getAllAndOverride.mockReturnValue([
                Role.ADMIN,
            ]);

            // Act
            const result = guard.canActivate(context);

            // Assert
            expect(result).toBe(true);
        });
    });
});
