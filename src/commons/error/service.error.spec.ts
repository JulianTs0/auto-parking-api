import { ServiceError } from './service.error'; // Ajustá la ruta
import { ErrorResponse } from './error-response.dto';
import { ErrorType } from './error-type.constants';

describe('ServiceError', () => {
    const mockErrorType = {
        message: 'NOT FOUND',
        status: 404,
    };

    it('debería inicializar la excepción mapeando el mensaje y el status correctamente', () => {
        // Act
        const error = new ServiceError(mockErrorType as ErrorType);

        // Assert
        expect(error.message).toBe(mockErrorType.message);
        expect(error.getStatus()).toBe(mockErrorType.status);
    });

    it('debería retornar una instancia de ErrorResponse con los datos correctos en toResponse()', () => {
        // Arrange
        const error = new ServiceError(mockErrorType as ErrorType);

        // Act
        const response = error.toResponse();

        // Assert
        expect(response).toBeInstanceOf(ErrorResponse);
        expect(response).toEqual({
            status: mockErrorType.status,
            message: mockErrorType.message,
        });
    });
});
