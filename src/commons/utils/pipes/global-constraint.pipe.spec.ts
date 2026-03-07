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
        it('debería loguear el warning y lanzar MISSING_REQUIRED_FIELDS si falla el isNotEmpty', () => {
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

            // Act & Assert
            expect(() => exceptionFactory(mockErrors)).toThrow(
                new ServiceError(Errors.MISSING_REQUIRED_FIELDS),
            );

            // Verificamos que el formateo del log se armó correctamente
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                'Invalid fields: email: [isNotEmpty, isEmail]',
            );
        });

        it('debería loguear el warning y lanzar INVALID_FIELDS si no hay errores de isNotEmpty', () => {
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

            // Act & Assert
            expect(() => exceptionFactory(mockErrors)).toThrow(
                new ServiceError(Errors.INVALID_FIELDS),
            );

            // Verificamos que junta múltiples propiedades con " | " como programaste
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                'Invalid fields: password: [minLength] | age: [isNumber]',
            );
        });

        it('no debería romper si constraints viene undefined', () => {
            // Arrange
            const mockErrors: ValidationError[] = [
                {
                    property: 'nestedObject',
                },
            ];

            // Act & Assert
            expect(() => exceptionFactory(mockErrors)).toThrow(
                new ServiceError(Errors.INVALID_FIELDS),
            );

            expect(loggerWarnSpy).toHaveBeenCalledWith(
                'Invalid fields: nestedObject: []',
            );
        });
    });
});
