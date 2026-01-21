export class PaymentMethod {
    public constructor(
        public id: string,
        public alias: string,
        public providerName: string,
        public accountNumber: string,
    ) {}

    static fromObject(object: { [key: string]: any }): PaymentMethod {
        return new PaymentMethod(
            object.id,
            object.alias,
            object.providerName,
            object.accountNumber,
        );
    }
}
