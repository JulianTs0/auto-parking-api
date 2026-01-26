import { PaymentType } from '../const/PaymentType';
import { Shift } from './Shift';
import { PaymentMethod } from './PaymentMethod';

export class Payment {
    public constructor(
        public id: string,
        public type: PaymentType,
        public amountDue: number,
        public amountReceived: number,
        public changeGiven: number,
        public transactionReference: string,
        public shift?: Shift | null,
        public paymentMethod?: PaymentMethod | null,
    ) {}

    static fromObject(object: { [key: string]: any }): Payment | null {
        if (!object) return null;
        return new Payment(
            object.id,
            object.type,
            object.amountDue,
            object.amountReceived,
            object.changeGiven,
            object.transactionReference,
            Shift.fromObject(object.shift),
            PaymentMethod.fromObject(object.paymentMethod),
        );
    }
}
