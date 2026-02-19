import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/commons/config/regex.validator';

export class LoginReq {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly password: string;
}
