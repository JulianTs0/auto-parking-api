import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { RegexValidators } from 'src/commons';

export class EditBody {
    @ApiProperty({
        example: 'Juan Editado',
        description: 'Nuevo nombre completo del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.NAME)
    readonly fullName: string;

    @ApiPropertyOptional({
        example: '+5491187654321',
        description:
            'Nuevo número de teléfono del usuario (opcional)',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PHONE)
    readonly phoneNumber: string | null;

    constructor(init?: Partial<EditBody>) {
        Object.assign(this, init);
    }
}
