import { HttpException } from '@nestjs/common';
import { ErrorType } from './ErrorType';
import { ErrorResponse } from './ErrorResponse';

export class ServiceError extends HttpException {
    constructor(error: ErrorType) {
        super(error.message, error.status);
    }

    public toResponse(): ErrorResponse {
        return new ErrorResponse(this.getStatus(), this.message);
    }
}
