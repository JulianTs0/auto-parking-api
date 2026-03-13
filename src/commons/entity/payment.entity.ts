import { PaymentType } from '../const/payment-type.enum';
import { Shift } from './shift.entity';
import { PaymentMethod } from './payment-method.entity';

export class Payment {
    public id: string;
    public type: PaymentType;
    public amountDue: number;
    public amountReceived: number;
    public changeGiven: number;
    public transactionReference: string;
    public shift: Shift | null;
    public paymentMethod: PaymentMethod | null;

    constructor(init?: Partial<Payment>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): Payment | null {
        if (!object) return null;
        const payment = new Payment();
        payment.id = object.id;
        payment.type = object.type;
        payment.amountDue = object.amountDue;
        payment.amountReceived = object.amountReceived;
        payment.changeGiven = object.changeGiven;
        payment.transactionReference = object.transactionReference;
        payment.shift = Shift.fromObject(object.shift);
        payment.paymentMethod = PaymentMethod.fromObject(
            object.paymentMethod,
        );
        return payment;
    }
}
