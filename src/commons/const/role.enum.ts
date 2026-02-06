export enum Role {
    ADMIN = 'Admin',
    OWNER = 'Owner',
    EMPLOYEE = 'Employee',
    CLIENT = 'Client',
}

export namespace Role {
    export function getValuesAsString(): string {
        return Object.values(Role)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
