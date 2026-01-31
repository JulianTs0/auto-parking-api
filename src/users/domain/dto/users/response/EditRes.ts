import { Role, UserStatus } from 'src/commons';

export class EditRes {
    public id: string;

    public fullName: string;

    public email: string;

    public phoneNumber: string;

    public status: UserStatus;

    public roles: Role[];
}
