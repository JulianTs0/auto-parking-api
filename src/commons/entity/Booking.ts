import { LogStatus } from '../const/LogStatus';
import { Vehicle } from './Vehicle';
import { ParkingSpot } from './ParkingSpot';
import { Subscription } from './Subscription';
import { StatusLog } from './StatusLog';
import { Payment } from './Payment';

export class Booking {
    public id: string;
    public startTime: Date;
    public endTime: Date;
    public totalPrice: number;
    public status: LogStatus;
    public vehicle: Vehicle | null;
    public spot: ParkingSpot | null;
    public subscription: Subscription | null;
    public statusLogs: StatusLog[];
    public payment: Payment | null;

    constructor(init?: Partial<Booking>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): Booking | null {
        if (!object) return null;
        const booking = new Booking();
        booking.id = object.id;
        booking.startTime = object.startTime;
        booking.endTime = object.endTime;
        booking.totalPrice = object.totalPrice;
        booking.status = object.status;
        booking.vehicle = Vehicle.fromObject(object.vehicle);
        booking.spot = ParkingSpot.fromObject(object.spot);
        booking.subscription = Subscription.fromObject(
            object.subscription,
        );
        booking.statusLogs = object.statusLogs
            ?.map((s: any) => StatusLog.fromObject(s))
            .filter((s): s is StatusLog => s !== null) || [];
        booking.payment = Payment.fromObject(object.payment);
        return booking;
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
