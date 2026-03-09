import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { AuthUser } from './auth-user.decorator'; // Importamos solo el decorador público
import { User } from '../entity/user.entity';

describe('@AuthUser Decorator', () => {
    const createMockContext = (mockUser?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: mockUser,
                }),
            }),
        } as unknown as ExecutionContext;
    };

    const getDecoratorFactory = () => {
        class TestController {
            public testMethod(@AuthUser() user: User) {}
        }

        const metadata = Reflect.getMetadata(
            ROUTE_ARGS_METADATA,
            TestController,
            'testMethod',
        );

        const key = Object.keys(metadata)[0];
        return metadata[key].factory;
    };

    it('debería extraer y retornar el objeto user de la request', () => {
        // Arrange
        const factory = getDecoratorFactory();
        const mockUser = {
            id: 'uuid-123',
            email: 'julian@test.com',
        } as User;
        const context = createMockContext(mockUser);

        // Act
        const result = factory(null, context);

        // Assert
        expect(result).toEqual(mockUser);
    });

    it('debería retornar undefined si no hay un usuario en la request', () => {
        // Arrange
        const factory = getDecoratorFactory();
        const context = createMockContext(undefined);

        // Act
        const result = factory(null, context);

        // Assert
        expect(result).toBeUndefined();
    });
});
