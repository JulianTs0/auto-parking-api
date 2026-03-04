import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResendEmailReq {
    @ApiProperty({
        example: 'juan.perez@ejemplo.com',
        description: 'Correo electrónico del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    constructor(init?: Partial<ResendEmailReq>) {
        Object.assign(this, init);
    }
}
