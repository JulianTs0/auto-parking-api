import { ApiProperty } from '@nestjs/swagger';

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
