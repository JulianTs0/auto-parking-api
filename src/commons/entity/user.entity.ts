import { Role } from '../const/role.enum';
import { UserStatus } from '../const/user-status.enum';
import { Subscription } from './subscription.entity';
import { Vehicle } from './vehicle.entity';
import { PaymentMethod } from './payment-method.entity';
import { ParkingLot } from './parking-lot.entity';

export class User {
    public id: string;

    public fullName: string;

    public email: string;

    public passwordHash: string;

    public status: UserStatus;

    public roles: Set<Role>;

    public createdAt: Date;

    public updatedAt: Date;

    public phoneNumber: string | null;

    public subscriptions: Subscription[];

    public vehicles: Vehicle[];

    public paymentMethods: PaymentMethod[];

    public parkingLots: ParkingLot[];

    constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }

    static fromObject(object: { [key: string]: any }): User | null {
        if (!object) return null;

        const user = new User();
        user.id = object.id;
        user.fullName = object.fullName;
        user.email = object.email;
        user.passwordHash = object.passwordHash;
        user.status = object.status;
        user.roles = object.roles;
        user.createdAt = object.createdAt;
        user.updatedAt = object.updatedAt;
        user.phoneNumber = object.phoneNumber;
        user.subscriptions =
            object.subscriptions
                ?.map((s: any) => Subscription.fromObject(s))
                .filter((s: any) => s !== null) || [];
        user.vehicles =
            object.vehicles
                ?.map((v: any) => Vehicle.fromObject(v))
                .filter((v: any) => v !== null) || [];
        user.paymentMethods =
            object.paymentMethods
                ?.map((p: any) => PaymentMethod.fromObject(p))
                .filter((p: any) => p !== null) || [];
        user.parkingLots =
            object.parkingLots
                ?.map((p: any) => ParkingLot.fromObject(p))
                .filter((p: any) => p !== null) || [];

        return user;
    }

    public isDeleted(): boolean {
        return (
            this.status === UserStatus.DELETED ||
            this.status === UserStatus.BANNED
        );
    }

    public isInactive(): boolean {
        return this.status === UserStatus.INACTIVE;
    }

    public isActive(): boolean {
        return (
            this.status === UserStatus.ACTIVE ||
            this.status == UserStatus.PENDING_OWNER
        );
    }

    public isPendingOwner(): boolean {
        return this.status === UserStatus.PENDING_OWNER;
    }

    public isAdmin(): boolean {
        return this.roles.has(Role.ADMIN);
    }
}
