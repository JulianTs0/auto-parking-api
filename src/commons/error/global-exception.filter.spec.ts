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

        it('debería retornar INTERNAL_ERROR y llamar a logger.error si no es HttpException', () => {
            // Arrange
            const unknownError = new Error('ERROR');
            const expectedResponse = ErrorResponse.errorType(
                Errors.INTERNAL_ERROR,
            );

            // Act
            filter.catch(unknownError, mockHost);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(
                expectedResponse.status,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expectedResponse,
            );

            expect(loggerErrorSpy).toHaveBeenCalled();
            expect(loggerWarnSpy).not.toHaveBeenCalled();
        });

        it('debería retornar el error mapeado por ServiceError y llamar a logger.warn si el status es < 500', () => {
            // Arrange
            const serviceError = new ServiceError(
                Errors.UNAUTHORIZED,
            );
            const expectedResponse = serviceError.toResponse();

            // Act
            filter.catch(serviceError, mockHost);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(
                expectedResponse.status,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expectedResponse,
            );

            expect(loggerWarnSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('debería extraer el status y message de un HttpException común', () => {
            // Arrange
            const httpStatus = 400;
            const exceptionMessage = 'BAD_REQUEST';

            // Simulamos un BadRequestException de NestJS
            const httpException = new HttpException(
                { message: exceptionMessage },
                httpStatus,
            );

            // Act
            filter.catch(httpException, mockHost);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(
                httpStatus,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: httpStatus,
                    message: exceptionMessage,
                }),
            );

            expect(loggerWarnSpy).toHaveBeenCalled();
            expect(loggerErrorSpy).not.toHaveBeenCalled();
        });

        it('debería manejar HttpExceptions donde el payload es un simple string', () => {
            // Arrange
            const httpStatus = 403;
            const stringPayload = 'FORBIDDEN';
            const httpException = new HttpException(
                stringPayload,
                httpStatus,
            );

            // Act
            filter.catch(httpException, mockHost);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(
                httpStatus,
            );
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: httpStatus,
                    message: stringPayload,
                }),
            );
        });
    });
});
