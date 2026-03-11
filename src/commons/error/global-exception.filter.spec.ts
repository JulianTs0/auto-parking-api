import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { GlobalExceptionHandler } from './global-exception.filter'; // Ajustá la ruta
import { ServiceError } from './service.error';
import { Errors } from './error-type.constants';
import { ErrorResponse } from './error-response.dto';

describe('GlobalExceptionHandler', () => {
    let filter: GlobalExceptionHandler;

    let mockResponse: any;
    let mockRequest: any;
    let mockHost: ArgumentsHost;

    beforeEach(() => {
        filter = new GlobalExceptionHandler();

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockRequest = {
            method: 'POST',
            url: '/api/test',
        };

        mockHost = {
            switchToHttp: () => ({
                getResponse: () => mockResponse,
                getRequest: () => mockRequest,
            }),
        } as unknown as ArgumentsHost;

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('catch()', () => {
        let loggerErrorSpy: jest.SpyInstance;
        let loggerWarnSpy: jest.SpyInstance;

        beforeEach(() => {
            loggerErrorSpy = jest
                .spyOn(Logger.prototype, 'error')
                .mockImplementation();
            loggerWarnSpy = jest
                .spyOn(Logger.prototype, 'warn')
                .mockImplementation();
        });

        it('should return INTERNAL_ERROR and call logger.error if not HttpException', () => {
            // Arrange
            const unknownError = new Error('ERROR');
            const expectedResponse = ErrorResponse.errorType(
                Errors.INTERNAL_ERROR,
            );

            // Act
            filter.catch(unknownError, mockHost);

            // Assert - status should be set to INTERNAL_ERROR status
            expect(mockResponse.status).toHaveBeenCalledWith(
                expectedResponse.status,
            );
            // Assert - json should be called with error response
            expect(mockResponse.json).toHaveBeenCalledWith(
                expectedResponse,
            );
            // Assert - logger.error should be called
            expect(loggerErrorSpy).toHaveBeenCalled();
            // Assert - logger.warn should not be called
            expect(loggerWarnSpy).not.toHaveBeenCalled();
        });

        it('should return mapped error by ServiceError and call logger.warn if status is < 500', () => {
            // Arrange
            const serviceError = new ServiceError(
                Errors.UNAUTHORIZED,
            );
            const expectedResponse = serviceError.toResponse();

            // Act
            filter.catch(serviceError, mockHost);

            // Assert - status should be set to mapped status
            expect(mockResponse.status).toHaveBeenCalledWith(
                expectedResponse.status,
            );
            // Assert - json should be called with mapped response
            expect(mockResponse.json).toHaveBeenCalledWith(
                expectedResponse,
            );
            // Assert - logger.warn should be called
            expect(loggerWarnSpy).toHaveBeenCalled();
            // Assert - logger.error should not be called
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should extract status and message from common HttpException', () => {
            // Arrange
            const httpStatus = 400;
            const exceptionMessage = 'BAD_REQUEST';

            // Simulate BadRequestException from NestJS
            const httpException = new HttpException(
                { message: exceptionMessage },
                httpStatus,
            );

            // Act
            filter.catch(httpException, mockHost);

            // Assert - status should be set to httpStatus
            expect(mockResponse.status).toHaveBeenCalledWith(
                httpStatus,
            );
            // Assert - json should contain status and message
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: httpStatus,
                    message: exceptionMessage,
                }),
            );
            // Assert - logger.warn should be called
            expect(loggerWarnSpy).toHaveBeenCalled();
            // Assert - logger.error should not be called
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('should handle HttpExceptions where payload is a simple string', () => {
            // Arrange
            const httpStatus = 403;
            const stringPayload = 'FORBIDDEN';
            const httpException = new HttpException(
                stringPayload,
                httpStatus,
            );

            // Act
            filter.catch(httpException, mockHost);

            // Assert - status should be set to httpStatus
            expect(mockResponse.status).toHaveBeenCalledWith(
                httpStatus,
            );
            // Assert - json should contain status and string message
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: httpStatus,
                    message: stringPayload,
                }),
            );
        });
    });
});
