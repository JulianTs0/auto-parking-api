import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { User } from 'src/commons';

export class DeleteReq {
    @ApiHideProperty()
    @IsNotEmpty()
    @IsObject()
    readonly user: User;

    @ApiHideProperty()
    @IsNotEmpty()
    @IsString()
    readonly id: string;

    @ApiProperty({
        example: 'Password123!',
        description:
            'Contraseña del usuario para confirmar la eliminación',
    })
    @IsNotEmpty()
    @IsString()
    readonly password: string;

    constructor(init?: Partial<DeleteReq>) {
        Object.assign(this, init);
    }
}
