import { IsNotEmpty, IsString } from 'class-validator';

export class GetByIdReq {
    @IsNotEmpty()
    @IsString()
    readonly id: string;

    constructor(init?: Partial<GetByIdReq>) {
        Object.assign(this, init);
    }
}
