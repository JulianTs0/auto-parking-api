import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { User } from 'src/commons';
import { RegexValidators } from 'src/users/domain/index';

export class EditReq {
    @IsNotEmpty()
    @IsObject()
    readonly user: User;

    @IsNotEmpty()
    @IsString()
    readonly id: string;

    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;

    constructor(init?: Partial<EditReq>) {
        Object.assign(this, init);
    }
}
