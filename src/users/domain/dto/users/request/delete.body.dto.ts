import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteBody {
    @ApiProperty({
        example: 'Password123!',
        description:
            'Contraseña del usuario para confirmar la eliminación',
    })
    @IsString()
    readonly password: string;

    constructor(init?: Partial<DeleteBody>) {
        Object.assign(this, init);
    }
}
