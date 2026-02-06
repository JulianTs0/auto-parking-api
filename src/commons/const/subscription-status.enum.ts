export enum SubscriptionStatus {
    ACTIVE = 'Active',
    EXPIRED = 'Expired',
    CANCELLED = 'Cancelled',
}

export namespace SubscriptionStatus {
    export function getValuesAsString(): string {
        return Object.values(SubscriptionStatus)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
