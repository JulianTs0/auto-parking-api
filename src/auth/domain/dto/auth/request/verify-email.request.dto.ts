import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailReq {
    @ApiProperty({
        example: 'token',
        description: 'Token',
    })
    @IsNotEmpty()
    @IsString()
    public token: string;

    constructor(init?: Partial<VerifyEmailReq>) {
        Object.assign(this, init);
    }
}
