import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/users/domain/index';

export class EditReq {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    fullName?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.EMAIL)
    email?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    phoneNumber?: string;
}
