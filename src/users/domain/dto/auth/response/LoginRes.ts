import { Token } from 'src/commons/dto/Token';

export class LoginRes {
    readonly token: Token;

    constructor(token: Token) {
        this.token = token;
    }
}
