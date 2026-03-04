import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Token } from 'src/commons';

export class SendRecoverMailReq {
    @ApiProperty({
        example: 'juan.perez@ejemplo.com',
        description: 'Correo electrónico del destinatario',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly to: string;

    @ApiProperty({
        example: 'Recuperación de contraseña',
        description: 'Asunto del correo electrónico',
    })
    @IsNotEmpty()
    @IsString()
    readonly subject: string;

    @ApiProperty({
        description: 'Token de recuperación de contraseña',
    })
    @ValidateNested()
    @Type(() => Token)
    readonly token: Token;

    constructor(init?: Partial<SendRecoverMailReq>) {
        Object.assign(this, init);
    }
}
