import { LogStatus } from '../const/LogStatus';
import { Vehicle } from './Vehicle';
import { ParkingSpot } from './ParkingSpot';
import { Subscription } from './Subscription';
import { StatusLog } from './StatusLog';
import { Payment } from './Payment';

export class Booking {
    public constructor(
        public id: string,
        public startTime: Date,
        public endTime: Date,
        public totalPrice: number,
        public status: LogStatus,
        public vehicle?: Vehicle,
        public spot?: ParkingSpot,
        public subscription?: Subscription,
        public statusLogs?: StatusLog[],
        public payment?: Payment,
    ) {}

    static fromObject(object: { [key: string]: any }): Booking {
        return new Booking(
            object.id,
            object.startTime,
            object.endTime,
            object.totalPrice,
            object.status,
            object.vehicle ? Vehicle.fromObject(object.vehicle) : undefined,
            object.spot ? ParkingSpot.fromObject(object.spot) : undefined,
            object.subscription
                ? Subscription.fromObject(object.subscription)
                : undefined,
            object.statusLogs
                ? object.statusLogs.map((s: any) => StatusLog.fromObject(s))
                : undefined,
            object.payment ? Payment.fromObject(object.payment) : undefined,
        );
    }

    public createReservation(): void {}
    public startImmediateUse(): void {}
    public checkIn(): void {}
    public checkOut(): void {}
    public cancel(): void {}
    public calculateTotal(): number {
        return 0;
    }
}
