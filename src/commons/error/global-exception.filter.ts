import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ServiceError } from './service.error';
import { Errors } from './error-type.constants';
import { ErrorResponse } from './error-response.dto';

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionHandler.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const httpHost = host.switchToHttp();
        const response = httpHost.getResponse<Response>();
        const request = httpHost.getRequest<Request>();

        let errorResponse: ErrorResponse = ErrorResponse.errorType(
            Errors.INTERNAL_ERROR,
        );

        if (exception instanceof HttpException) {
            if (exception instanceof ServiceError) {
                errorResponse = exception.toResponse();
            } else {
                const status: number = exception.getStatus();
                const res = exception.getResponse();
                const message: string =
                    typeof res === 'object' && (res as any).message
                        ? (res as any).message
                        : res;

                errorResponse = new ErrorResponse(status, message);
            }
        }

        const logMessage: string = `
            [${request.method}] ${request.url} - 
            Status: ${errorResponse.status} - 
            Message: ${errorResponse.message}
        `;

        if (errorResponse.status >= 500) {
            this.logger.error(
                logMessage,
                exception instanceof Error
                    ? exception.stack
                    : String(exception),
            );
        } else {
            this.logger.warn(logMessage);
        }

        response.status(errorResponse.status).json(errorResponse);
    }
}
