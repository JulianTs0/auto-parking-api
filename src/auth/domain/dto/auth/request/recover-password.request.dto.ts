import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RecoverPasswordReq {
    @ApiProperty({
        example: 'juan.perez@ejemplo.com',
        description:
            'Correo electrónico del usuario que desea recuperar la contraseña',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    constructor(init?: Partial<RecoverPasswordReq>) {
        Object.assign(this, init);
    }
}
