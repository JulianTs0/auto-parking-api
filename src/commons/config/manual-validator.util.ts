import { validateSync } from 'class-validator';
import { ServiceError } from '../error/service.error';
import { Errors } from '../error/error-type.constants';

export class ManualValidator {
    public constructor() { }

    public static validate(request: any): void {
        const errors = validateSync(request);

        if (errors.length > 0) {
            const allConstraints = errors
                .map((error) => error.constraints)
                .filter((constraint) => constraint !== undefined)
                .map((constraint) => Object.keys(constraint))
                .flat();

            const hasMissingFields =
                allConstraints.includes('isNotEmpty');

            if (hasMissingFields) {
                throw new ServiceError(
                    Errors.MISSING_REQUIRED_FIELDS,
                );
            }

            throw new ServiceError(Errors.INVALID_FIELDS);
        }
    }
}
