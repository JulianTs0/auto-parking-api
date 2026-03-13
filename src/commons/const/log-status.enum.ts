export enum LogStatus {
    RESERVED = 'Reserved',
    ACTIVE = 'Active',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
}

export namespace LogStatus {
    export function getValuesAsString(): string {
        return Object.values(LogStatus)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
