import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { OwnerRequestStatus } from 'src/commons/const/owner-request-status.enum';
import { UserModel } from './user.model';

@Entity({ name: 'owner_requests' })
@Check(`"status" IN (${OwnerRequestStatus.getValuesAsString()})`)
export class OwnerRequestModel {
    @PrimaryColumn('uuid')
    public id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    public userId: string;

    @ManyToOne(() => UserModel, {
        onDelete: 'CASCADE',
        nullable: true,
        eager: false,
    })
    @JoinColumn({ name: 'user_id' })
    public user?: UserModel;

    @Column({
        name: 'status',
        type: 'varchar',
        default: OwnerRequestStatus.PENDING,
        nullable: false,
    })
    public status: OwnerRequestStatus;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
