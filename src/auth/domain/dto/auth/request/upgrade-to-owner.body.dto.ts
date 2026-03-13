import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpgradeToOwnerBody {
    @ApiProperty({
        example: 'client@ejemplo.com',
        description:
            'Email del usuario que desea convertirse en owner',
    })
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    constructor(init?: Partial<UpgradeToOwnerBody>) {
        Object.assign(this, init);
    }
}
