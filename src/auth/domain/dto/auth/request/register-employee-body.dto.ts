import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/commons';

export class RegisterEmployeeBody {
    @ApiProperty({
        example: 'Juan Perez',
        description: 'Nombre completo del empleado',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string;

    @ApiProperty({
        example: 'juan.perez@ejemplo.com',
        description: 'Correo electrónico único del empleado',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @ApiPropertyOptional({
        required: false,
        example: '+5491112345678',
        description: 'Número de teléfono del empleado (opcional)',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;

    @ApiProperty({
        example: 'Segura123!',
        description:
            'Contraseña para la cuenta del empleado (Debe cumplir con los requisitos de seguridad)',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly password: string;

    constructor(init?: Partial<RegisterEmployeeBody>) {
        Object.assign(this, init);
    }
}
