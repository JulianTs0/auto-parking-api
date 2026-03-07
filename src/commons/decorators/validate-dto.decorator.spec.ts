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

    it('debería ejecutar el método original si el payload cumple con el DTO', () => {
        // Arrange
        const payloadValido = { name: 'Backend Dev' };

        // Act
        const result = service.exec(payloadValido);

        // Assert
        expect(result).toBe(true);
    });

    it('debería lanzar ServiceError(INTERNAL_ERROR) si la validación falla', () => {
        // Arrange
        const invalidPayload = {};

        // Act & Assert
        expect(() => service.exec(invalidPayload)).toThrow(
            new ServiceError(Errors.INTERNAL_ERROR),
        );
    });
});
