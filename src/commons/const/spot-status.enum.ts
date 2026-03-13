export enum SpotStatus {
    UNREGISTERED = 'Unregistered',
    AVAILABLE = 'Available',
    OCCUPIED = 'Occupied',
    MAINTENANCE = 'Maintenance',
}

export namespace SpotStatus {
    export function getValuesAsString(): string {
        return Object.values(SpotStatus)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
