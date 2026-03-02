import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AcceptOwnerRequestBody {
    @ApiProperty({
        example: 'owner@ejemplo.com',
        description: 'Email del usuario que será owner',
    })
    @IsNotEmpty()
    @IsEmail()
    readonly ownerEmail: string;

    constructor(init?: Partial<AcceptOwnerRequestBody>) {
        Object.assign(this, init);
    }
}
