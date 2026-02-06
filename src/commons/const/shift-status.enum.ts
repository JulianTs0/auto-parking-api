export enum ShiftStatus {
    OPEN = 'Open',
    CLOSED = 'Closed',
}

export namespace ShiftStatus {
    export function getValuesAsString(): string {
        return Object.values(ShiftStatus)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
