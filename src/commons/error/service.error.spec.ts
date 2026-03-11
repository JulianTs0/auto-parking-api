import { ServiceError } from './service.error';
import { ErrorResponse } from './error-response.dto';
import { ErrorType } from './error-type.constants';

describe('ServiceError', () => {
    const mockErrorType = {
        message: 'NOT FOUND',
        status: 404,
    };

    it('should initialize exception mapping message and status correctly', () => {
        // Act
        const error = new ServiceError(mockErrorType as ErrorType);

        // Assert - message should be mapped
        expect(error.message).toBe(mockErrorType.message);
        // Assert - status should be mapped
        expect(error.getStatus()).toBe(mockErrorType.status);
    });

    it('should return ErrorResponse instance with correct data in toResponse()', () => {
        // Arrange
        const error = new ServiceError(mockErrorType as ErrorType);

        // Act
        const response = error.toResponse();

        // Assert - should be instance of ErrorResponse
        expect(response).toBeInstanceOf(ErrorResponse);
        // Assert - should have correct status and message
        expect(response).toEqual({
            status: mockErrorType.status,
            message: mockErrorType.message,
        });
    });
});
