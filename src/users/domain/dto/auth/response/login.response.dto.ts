import { Token } from 'src/commons';

export class LoginRes {
    public token: Token;

    constructor(init?: Partial<LoginRes>) {
        Object.assign(this, init);
    }
}
