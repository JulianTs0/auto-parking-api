import { Token } from 'src/commons/dto/token.dto';

export class LoginRes {
    public token: Token;

    constructor(init?: Partial<LoginRes>) {
        Object.assign(this, init);
    }
}
