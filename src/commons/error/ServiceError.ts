import { ErrorType } from './ErrorType';

export class ServiceError extends Error {
    public status: number;

    constructor(error: ErrorType) {
        super(error.message);
        this.name = 'ServiceError';
        this.status = error.status;

        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}
