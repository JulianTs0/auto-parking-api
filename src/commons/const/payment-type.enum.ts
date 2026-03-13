export enum PaymentType {
    CASH = 'Cash',
    ELECTRONIC = 'Electronic',
}

export namespace PaymentType {
    export function getValuesAsString(): string {
        return Object.values(PaymentType)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
