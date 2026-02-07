import { IsNotEmpty, IsString } from 'class-validator';

export class AuthReq {
    @IsNotEmpty()
    @IsString()
    readonly authorization: string;
}
