import { Role, UserStatus } from 'src/commons';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryColumn('uuid')
    public id: string;

    @Column({ name: 'full_name', nullable: false })
    public fullName: string;

    @Column({ name: 'email', unique: true })
    public email: string;

    @Column({ name: 'phone_number' })
    public phoneNumber: string;

    @Column({ name: 'password_hash', nullable: false })
    public passwordHash: string;

    @Column({
        name: 'status',
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.INACTIVE,
        nullable: false,
    })
    public status: UserStatus;

    @Column({
        name: 'roles',
        type: 'enum',
        enum: Role,
        array: true,
        default: [Role.CLIENT],
        nullable: false,
    })
    public roles: Role[];
}
