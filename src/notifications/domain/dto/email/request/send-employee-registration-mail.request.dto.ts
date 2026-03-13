import { Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Token } from 'src/commons';

export class SendEmployeeRegistrationMailReq {
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

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly ownerEmail: string;

    @IsNotEmpty()
    @IsString()
    readonly ownerFullName: string;

    constructor(init?: Partial<SendEmployeeRegistrationMailReq>) {
        Object.assign(this, init);
    }
}
