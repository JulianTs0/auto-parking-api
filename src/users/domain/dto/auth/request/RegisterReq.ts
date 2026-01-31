import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/users/domain/validator/RegexValidators';

export class RegisterReq {
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    fullName: string;

    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.EMAIL)
    email: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    phoneNumber?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    password: string;
}
