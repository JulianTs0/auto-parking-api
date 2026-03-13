import { ApiProperty } from '@nestjs/swagger';
import { OwnerRequestItemRes } from './owner-request-item.dto';

export class GetOwnerRequestRes {
    @ApiProperty({
        type: [OwnerRequestItemRes],
        description: 'Lista de solicitudes de owner',
    })
    public readonly requests: OwnerRequestItemRes[];

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
