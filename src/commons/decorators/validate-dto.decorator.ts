import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ServiceError } from '../error/service.error';
import { Errors } from '../error/error-type.constants';

export function ValidateDto(dtoClass: any) {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            const instance = plainToInstance(dtoClass, args[0]);
            const errors = validateSync(instance);

            if (errors.length > 0) {
                throw new ServiceError(Errors.INTERNAL_ERROR);
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
