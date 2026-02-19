import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/commons/config/regex.validator';

export class RegisterReq {
    @ApiProperty({
        example: 'Juan Perez',
        description: 'Nombre completo del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string;

    @ApiProperty({
        example: 'juan.perez@ejemplo.com',
        description: 'Correo electrónico único del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        required: false,
        example: '+5491112345678',
        description: 'Número de teléfono del usuario (opcional)',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;

    @ApiProperty({
        example: 'Segura123!',
        description:
            'Contraseña para la cuenta (Debe cumplir con los requisitos de seguridad)',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly password: string;
}
