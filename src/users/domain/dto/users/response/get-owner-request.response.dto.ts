import { ApiProperty } from '@nestjs/swagger';
import { GetByIdRes } from './get-by-id.response.dto';

export class GetOwnerRequestRes {
    @ApiProperty({
        type: [GetByIdRes],
        description: 'Lista de usuarios',
    })
    public readonly users: GetByIdRes[];

    @ApiProperty({
        example: 2,
        description:
            'Número de la siguiente página (null si no hay más páginas)',
        nullable: true,
    })
    public readonly nextPage: number | null;

    constructor(init?: Partial<GetOwnerRequestRes>) {
        Object.assign(this, init);
    }
}
