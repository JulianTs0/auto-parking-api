import { ApiProperty } from '@nestjs/swagger';
import { OwnerRequestStatus } from 'src/commons';
import { OwnerRequestUserData } from './owner-request-user-data.dto';

export class OwnerRequestItemRes {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Identificador único de la solicitud',
    })
    public readonly id: string;

    @ApiProperty({
        enum: OwnerRequestStatus,
        example: OwnerRequestStatus.PENDING,
        description: 'Estado de la solicitud de owner',
    })
    public readonly status: OwnerRequestStatus;

    @ApiProperty({
        example: '2023-01-01T12:00:00Z',
        description: 'Fecha de creación de la solicitud',
    })
    public readonly createdAt: Date;

    @ApiProperty({
        example: '2023-01-02T12:00:00Z',
        description:
            'Fecha de la última actualización de la solicitud',
    })
    public readonly updatedAt: Date;

    @ApiProperty({
        type: OwnerRequestUserData,
        description: 'Datos del usuario que hizo la solicitud',
    })
    public readonly user: OwnerRequestUserData;

    constructor(init?: Partial<OwnerRequestItemRes>) {
        Object.assign(this, init);
    }
}
