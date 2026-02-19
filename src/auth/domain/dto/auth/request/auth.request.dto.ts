import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthReq {
    @ApiProperty({
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'Token de autenticación JWT en formato Bearer',
    })
    @IsNotEmpty()
    @IsString()
    readonly authorization: string;
}
