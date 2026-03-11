import { Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
    ServiceError,
    Errors,
    GlobalConstraintHandler,
} from 'src/commons';

describe('GlobalConstraintHandler', () => {
    let handler: GlobalConstraintHandler;
    let loggerWarnSpy: jest.SpyInstance;
    let exceptionFactory: (errors: ValidationError[]) => any;

    beforeEach(() => {
        handler = new GlobalConstraintHandler();

        loggerWarnSpy = jest
            .spyOn(Logger.prototype, 'warn')
            .mockImplementation();

        exceptionFactory = handler['exceptionFactory'];

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sanity check', () => {
        expect(handler).toBeDefined();
    });

    describe('exceptionFactory()', () => {
        it('should log warning and throw MISSING_REQUIRED_FIELDS if isNotEmpty fails', () => {
            // Arrange
            const mockErrors: ValidationError[] = [
                {
                    property: 'email',
                    constraints: {
                        isNotEmpty: 'email should not be empty',
                        isEmail: 'email must be an email',
                    },
                },
            ];

            // Act & Assert - should throw MISSING_REQUIRED_FIELDS error
            expect(() => exceptionFactory(mockErrors)).toThrow(
                new ServiceError(Errors.MISSING_REQUIRED_FIELDS),
            );

            // Assert - log should be called with correct format
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                'Invalid fields: email: [isNotEmpty, isEmail]',
            );
        });

        it('should log warning and throw INVALID_FIELDS if there are no isNotEmpty errors', () => {
            // Arrange
            const mockErrors: ValidationError[] = [
                {
                    property: 'password',
                    constraints: {
                        minLength:
                            'password must be longer than or equal to 8 characters',
                    },
                },
                {
                    property: 'age',
                    constraints: {
                        isNumber:
                            'age must be a number conforming to the specified constraints',
                    },
                },
            ];

            // Act & Assert - should throw INVALID_FIELDS error
            expect(() => exceptionFactory(mockErrors)).toThrow(
                new ServiceError(Errors.INVALID_FIELDS),
            );

            // Assert - log should join multiple properties with " | "
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                'Invalid fields: password: [minLength] | age: [isNumber]',
            );
        });

        it('should not break if constraints is undefined', () => {
            // Arrange
            const mockErrors: ValidationError[] = [
                {
                    property: 'nestedObject',
                },
            ];

            // Act & Assert - should throw INVALID_FIELDS error
            expect(() => exceptionFactory(mockErrors)).toThrow(
                new ServiceError(Errors.INVALID_FIELDS),
            );

            // Assert - log should show empty constraints
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                'Invalid fields: nestedObject: []',
            );
        });
    });
});
