import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { User } from 'src/commons';

export class DeleteReq {
    @IsNotEmpty()
    @IsObject()
    readonly user: User;

    @IsNotEmpty()
    @IsString()
    readonly id: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;

    constructor(init?: Partial<DeleteReq>) {
        Object.assign(this, init);
    }
}
