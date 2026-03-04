import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from 'src/commons';

export class GetByIdRes {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Identificador único del usuario',
    })
    public readonly id: string;

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

    @ApiProperty({
        enum: UserStatus,
        example: UserStatus.ACTIVE,
        description: 'Estado actual de la cuenta del usuario',
    })
    public readonly status: UserStatus;

    @ApiProperty({
        enum: Role,
        isArray: true,
        example: [Role.CLIENT],
        description: 'Roles asignados al usuario',
    })
    public readonly roles: Role[];

    @ApiProperty({
        example: '2023-01-01T12:00:00Z',
        description: 'Fecha de creación del usuario',
    })
    public readonly createdAt: Date;

    @ApiProperty({
        example: '2023-01-02T12:00:00Z',
        description: 'Fecha de la última actualización del usuario',
    })
    public readonly updatedAt: Date;

    constructor(init?: Partial<GetByIdRes>) {
        Object.assign(this, init);
    }
}
