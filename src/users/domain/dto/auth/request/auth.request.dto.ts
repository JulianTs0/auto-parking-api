import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthReq {
    @Expose({ name: 'authorization' })
    @IsNotEmpty()
    @IsString()
    readonly token: string;
}
