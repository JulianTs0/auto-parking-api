import { ApiProperty } from '@nestjs/swagger';
import { Token } from 'src/commons';

export class LoginRes {
    @ApiProperty({
        type: Token,
        description:
            'Token de acceso generado tras un inicio de sesión exitoso',
    })
    public token: Token;

    constructor(init?: Partial<LoginRes>) {
        Object.assign(this, init);
    }
}
