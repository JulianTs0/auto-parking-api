import { Role, UserStatus } from 'src/commons';

export class EditRes {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;
    readonly phoneNumber: string;
    readonly status: UserStatus;
    readonly roles: Role[];

    constructor(
        id: string,
        fullName: string,
        email: string,
        phoneNumber: string,
        status: UserStatus,
        roles: Role[],
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.status = status;
        this.roles = roles;
    }
}
