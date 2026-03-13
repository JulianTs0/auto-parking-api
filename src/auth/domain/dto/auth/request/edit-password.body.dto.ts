import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { RegexValidators } from 'src/commons';

export class EditPasswordBody {
    @ApiProperty({
        example: 'NuevaSegura123!',
        description: 'Nueva contraseña para la cuenta del usuario',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(RegexValidators.PASSWORD)
    readonly newPassword: string;

    constructor(init?: Partial<EditPasswordBody>) {
        Object.assign(this, init);
    }
}
