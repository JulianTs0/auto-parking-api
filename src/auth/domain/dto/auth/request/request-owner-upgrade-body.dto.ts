import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestOwnerUpgradeBody {
    @ApiProperty({
        example: 'client@ejemplo.com',
        description:
            'Email del usuario que solicita convertirse en owner',
    })
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    constructor(init?: Partial<RequestOwnerUpgradeBody>) {
        Object.assign(this, init);
    }
}
