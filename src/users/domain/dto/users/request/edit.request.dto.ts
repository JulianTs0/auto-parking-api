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
    readonly id: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string | null;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.EMAIL)
    readonly email: string | null;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;
}
