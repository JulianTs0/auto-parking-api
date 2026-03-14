import { HttpException } from '@nestjs/common';
import { ErrorType } from './error-type.constants';
import { ErrorResponse } from './error-response.dto';

export class ServiceError extends HttpException {
    public readonly key: string;

    constructor(error: ErrorType) {
        super(error.message, error.status);
        this.key = error.key;
    }

    public toResponse(): ErrorResponse {
        return new ErrorResponse(
            this.getStatus(),
            this.message,
            this.key,
        );
    }
}
