import { Role, UserStatus } from 'src/commons';

export class GetByIdRes {
    public readonly id: string;
    public readonly fullName: string;
    public readonly email: string;
    public readonly phoneNumber: string | null;
    public readonly status: UserStatus;
    public readonly roles: Role[];
    public readonly createdAt: Date;
    public readonly updateAt: Date;

    constructor(init?: Partial<GetByIdRes>) {
        Object.assign(this, init);
    }
}
