import { IsNotEmpty, IsString } from 'class-validator';

export class GetByIdReq {
    @IsNotEmpty()
    @IsString()
    readonly id: string;
}
