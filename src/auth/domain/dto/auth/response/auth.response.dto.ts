import { Role, UserStatus } from 'src/commons';

export class AuthRes {
    public readonly id: string;
    public readonly fullName: string;
    public readonly email: string;
    public readonly phoneNumber: string | null;
    public readonly status: UserStatus;
    public readonly roles: Role[];
    public readonly createdAt: Date;
    public readonly updateAt: Date;

    constructor(init?: Partial<AuthRes>) {
        Object.assign(this, init);
    }
}
