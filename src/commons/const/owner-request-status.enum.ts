export enum OwnerRequestStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    COMPLETED = 'Completed',
}

export namespace OwnerRequestStatus {
    export function getValuesAsString(): string {
        return Object.values(OwnerRequestStatus)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
