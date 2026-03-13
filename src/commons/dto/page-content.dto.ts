export class PageContent<T> {
    public readonly content: T[];

    public readonly page: number;

    public readonly nextPage: number | null;

    constructor(init?: Partial<PageContent<T>>) {
        Object.assign(this, init);
    }
}
