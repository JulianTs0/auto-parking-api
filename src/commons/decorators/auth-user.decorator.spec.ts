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

    it('should extract and return user object from request', () => {
        // Arrange
        const factory = getDecoratorFactory();
        const mockUser = {
            id: 'uuid-123',
            email: 'julian@test.com',
        } as User;
        const context = createMockContext(mockUser);

        // Act
        const result = factory(null, context);

        // Assert - should return user object
        expect(result).toEqual(mockUser);
    });

    it('should return undefined if there is no user in request', () => {
        // Arrange
        const factory = getDecoratorFactory();
        const context = createMockContext(undefined);

        // Act
        const result = factory(null, context);

        // Assert - should return undefined
        expect(result).toBeUndefined();
    });
});
