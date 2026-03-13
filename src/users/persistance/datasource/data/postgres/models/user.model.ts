import { Role, UserStatus } from 'src/commons';
import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@Check(`"status" IN (${UserStatus.getValuesAsString()})`)
@Check(`"roles" <@ ARRAY[${Role.getValuesAsString()}]::varchar[]`)
export class UserModel {
    @PrimaryColumn('uuid')
    public id: string;

    @Column({ name: 'full_name', nullable: false, length: 100 })
    public fullName: string;

    @Column({ name: 'email', unique: true, length: 100 })
    public email: string;

    @Column({
        name: 'phone_number',
        type: 'varchar',
        length: 50,
        nullable: true,
    })
    public phoneNumber: string | null;

    @Column({ name: 'password_hash', nullable: false, length: 255 })
    public passwordHash: string;

    @Column({
        name: 'status',
        type: 'varchar',
        default: UserStatus.INACTIVE,
        nullable: false,
    })
    public status: UserStatus;

    @Column({
        name: 'roles',
        type: 'varchar',
        array: true,
        default: [Role.CLIENT],
        nullable: false,
    })
    public roles: Role[];

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
