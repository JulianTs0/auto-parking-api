import { Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Errors } from '../../error/error-type.constants';
import { ServiceError } from '../../error/service.error';

export class GlobalConstraintHandler extends ValidationPipe {
    private readonly logger = new Logger(
        GlobalConstraintHandler.name,
    );
    constructor() {
        super({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
            validateCustomDecorators: false,
            exceptionFactory: (errors: ValidationError[]) => {
                const formattedErrors = errors
                    .map((err) => {
                        const failedRules = Object.keys(
                            err.constraints || {},
                        ).join(', ');
                        return `${err.property}: [${failedRules}]`;
                    })
                    .join(' | ');

                this.logger.warn(
                    `Invalid fields: ${formattedErrors}`,
                );

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
            },
        });
    }
}
