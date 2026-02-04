export class Token {
    public accessToken: string;

    constructor(init?: Partial<Token>) {
        Object.assign(this, init);
    }
}
