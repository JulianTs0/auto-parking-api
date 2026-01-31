import { Role } from '../const/Role';
import { UserStatus } from '../const/UserStatus';
import { Subscription } from './Subscription';
import { Vehicle } from './Vehicle';
import { PaymentMethod } from './PaymentMethod';
import { ParkingLot } from './ParkingLot';

export class User {
    public constructor(
        public id: string,

        public fullName: string,

        public email: string,

        public phoneNumber: string,

        public passwordHash: string,

        public status: UserStatus,

        public roles: Set<Role>,

        public subscriptions?: Subscription[],

        public vehicles?: Vehicle[],

        public paymentMethods?: PaymentMethod[],

        public parkingLots?: ParkingLot[],
    ) {}

    static fromObject(object: { [key: string]: any }): User | null {
        if (!object) return null;
        return new User(
            object.id,
            object.fullName,
            object.email,
            object.phoneNumber,
            object.passwordHash,
            object.status,
            object.roles,

            object.subscriptions
                ?.map((s: any) => Subscription.fromObject(s))
                .filter((s): s is Subscription => s !== null),

            object.vehicles
                ?.map((v: any) => Vehicle.fromObject(v))
                .filter((v): v is Vehicle => v !== null),

            object.paymentMethods
                ?.map((p: any) => PaymentMethod.fromObject(p))
                .filter((p): p is PaymentMethod => p !== null),

            object.parkingLots
                ?.map((p: any) => ParkingLot.fromObject(p))
                .filter((p): p is ParkingLot => p !== null),
        );
    }
}
