import { Role, UserStatus } from 'src/commons';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserModel {
    @PrimaryColumn('uuid')
    public id: string;

    @Column({ name: 'full_name', nullable: false, length: 100 })
    public fullName: string;

    @Column({ name: 'email', unique: true, length: 100 })
    public email: string;

    @Column({ name: 'phone_number', length: 50 })
    public phoneNumber: string;

    @Column({ name: 'password_hash', nullable: false, length: 255 })
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
