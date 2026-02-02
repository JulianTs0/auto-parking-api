import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { RegexValidators } from 'src/users/domain/validator/RegexValidators';

export class LoginReq {
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.EMAIL)
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly password: string;
}
