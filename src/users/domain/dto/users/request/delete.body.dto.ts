import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteBody {
    @ApiProperty({
        example: 'Password123!',
        description:
            'Contraseña del usuario para confirmar la eliminación',
    })
    @IsNotEmpty()
    @IsString()
    readonly password: string;

    constructor(init?: Partial<DeleteBody>) {
        Object.assign(this, init);
    }
}
