import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class GetOwnerRequestQuery {
    @ApiProperty({
        example: 1,
        description: 'Número de página (mínimo 1)',
    })
    @IsNumber()
    @Min(1)
    readonly page: number;

    @ApiProperty({
        example: 10,
        description:
            'Cantidad de elementos por página (mínimo 1, máximo 25)',
    })
    @IsNumber()
    @Min(1)
    @Max(25)
    readonly size: number;

    constructor(init?: Partial<GetOwnerRequestQuery>) {
        Object.assign(this, init);
    }
}
