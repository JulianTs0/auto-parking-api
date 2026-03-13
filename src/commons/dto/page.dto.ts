export class Page<T> {
    public readonly content: T[];

    public readonly totalElements: number;

    public readonly totalPages: number;

    public readonly size: number;

    public readonly page: number;

    public readonly hasNext: boolean;

    constructor(
        content: T[],
        totalElements: number,
        page: number,
        size: number,
    ) {
        this.content = content;
        this.totalElements = totalElements;
        this.page = page;
        this.size = size;
        this.totalPages = Math.ceil(totalElements / size);
        this.hasNext = page < this.totalPages;
    }
}
