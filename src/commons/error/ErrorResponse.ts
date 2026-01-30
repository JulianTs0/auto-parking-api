import { ErrorType } from './ErrorType';

export class ErrorResponse {
    constructor(
        public status: number,
        public message: string,
    ) {}

    static errorType(errorType: ErrorType): ErrorResponse {
        return new ErrorResponse(errorType.status, errorType.message);
    }
}
