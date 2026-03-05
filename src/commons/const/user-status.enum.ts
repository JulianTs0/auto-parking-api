export enum UserStatus {
    INACTIVE = 'Inactive',
    ACTIVE = 'Active',
    PENDING_OWNER = 'PendingOwner',
    BANNED = 'Banned',
    DELETED = 'Deleted',
}

export namespace UserStatus {
    export function getValuesAsString(): string {
        return Object.values(UserStatus)
            .filter((v) => typeof v === 'string')
            .map((v) => `'${v}'`)
            .join(', ');
    }
}
