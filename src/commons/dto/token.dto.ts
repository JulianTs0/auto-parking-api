import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Token {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Token JWT de acceso',
    })
    @IsNotEmpty()
    @IsString()
    public accessToken: string;

    constructor(init?: Partial<Token>) {
        Object.assign(this, init);
    }
}
