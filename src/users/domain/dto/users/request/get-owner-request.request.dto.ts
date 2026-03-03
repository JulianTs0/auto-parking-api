import { User } from 'src/commons';

export class GetOwnerRequestReq {
    readonly authUser: User;

    readonly page: number;

    readonly size: number;

    constructor(init?: Partial<GetOwnerRequestReq>) {
        Object.assign(this, init);
    }
}
