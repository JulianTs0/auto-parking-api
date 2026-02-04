export class PaymentMethod {
    public id: string;
    public alias: string;
    public providerName: string;
    public accountNumber: string;

    constructor(init?: Partial<PaymentMethod>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): PaymentMethod | null {
        if (!object) return null;
        const paymentMethod = new PaymentMethod();
        paymentMethod.id = object.id;
        paymentMethod.alias = object.alias;
        paymentMethod.providerName = object.providerName;
        paymentMethod.accountNumber = object.accountNumber;
        return paymentMethod;
    }
}
