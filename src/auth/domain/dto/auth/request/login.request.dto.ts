import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/commons/config/regex.validator';

export class LoginReq {
    @ApiProperty({
        example: 'usuario@ejemplo.com',
        description: 'Correo electrónico del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @ApiProperty({
        example: 'Password123!',
        description:
            'Contraseña del usuario (Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial)',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly password: string;
}
