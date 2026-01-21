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
        public shift?: Shift,
        public paymentMethod?: PaymentMethod,
    ) {}

    static fromObject(object: { [key: string]: any }): Payment {
        return new Payment(
            object.id,
            object.type,
            object.amountDue,
            object.amountReceived,
            object.changeGiven,
            object.transactionReference,
            object.shift ? Shift.fromObject(object.shift) : undefined,
            object.paymentMethod
                ? PaymentMethod.fromObject(object.paymentMethod)
                : undefined,
        );
    }
}
