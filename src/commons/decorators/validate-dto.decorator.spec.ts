import { IsString, IsNotEmpty } from 'class-validator';
import { ValidateDto } from './validate-dto.decorator';
import { ServiceError, Errors } from 'src/commons';

class DummyDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

class DummyService {
    @ValidateDto(DummyDto)
    exec(payload: any): boolean {
        return true;
    }
}

describe('@ValidateDto Decorator', () => {
    let service: DummyService;

    beforeEach(() => {
        service = new DummyService();
    });

    it('should execute original method if payload complies with DTO', () => {
        // Arrange
        const payloadValido = { name: 'Backend Dev' };

        // Act
        const result = service.exec(payloadValido);

        // Assert - should return true
        expect(result).toBe(true);
    });

    it('should throw ServiceError(INTERNAL_ERROR) if validation fails', () => {
        // Arrange
        const invalidPayload = {};

        // Act & Assert - should throw INTERNAL_ERROR
        expect(() => service.exec(invalidPayload)).toThrow(
            new ServiceError(Errors.INTERNAL_ERROR),
        );
    });
});
