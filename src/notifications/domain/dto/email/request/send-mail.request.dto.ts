import { Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Token } from 'src/commons';

export class SendMailReq {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly to: string;

    @IsNotEmpty()
    @IsString()
    readonly subject: string;

    @ValidateNested()
    @Type(() => Token)
    readonly token: Token;
}
