import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { User } from 'src/commons';
import { RegexValidators } from 'src/commons/config/regex.validator';

export class EditReq {
    @ApiHideProperty()
    @IsNotEmpty()
    @IsObject()
    readonly user: User;

    @ApiHideProperty()
    @IsNotEmpty()
    @IsString()
    readonly id: string;

    @ApiProperty({
        example: 'Juan Editado',
        description: 'Nuevo nombre completo del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string;

    @ApiProperty({
        required: false,
        example: '+5491187654321',
        description:
            'Nuevo número de teléfono del usuario (opcional)',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;

    constructor(init?: Partial<EditReq>) {
        Object.assign(this, init);
    }
}
