import { ApiProperty } from '@nestjs/swagger';
import { OwnerRequestStatus } from 'src/commons';

export class OwnerRequestUserData {
    @ApiProperty({
        example: 'Juan Perez',
        description: 'Nombre completo del usuario',
    })
    public readonly fullName: string;

    @ApiProperty({
        example: 'juan.perez@ejemplo.com',
        description: 'Correo electrónico del usuario',
    })
    public readonly email: string;

    @ApiProperty({
        required: false,
        nullable: true,
        example: '+5491112345678',
        description: 'Número de teléfono del usuario',
    })
    public readonly phoneNumber: string | null;

    constructor(init?: Partial<OwnerRequestUserData>) {
        Object.assign(this, init);
    }
}

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
