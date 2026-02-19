import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/commons/config/regex.validator';

export class RegisterReq {
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;

    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly password: string;
}
