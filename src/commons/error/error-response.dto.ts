import { ErrorType } from './error-type.constants';

export class ErrorResponse {
    constructor(
        public readonly status: number,
        public readonly message: string,
        public readonly key: string,
    ) {}

    static errorType(errorType: ErrorType): ErrorResponse {
        return new ErrorResponse(
            errorType.status,
            errorType.message,
            errorType.key,
        );
    }
}
