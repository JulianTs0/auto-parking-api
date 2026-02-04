import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteReq {
    @IsNotEmpty()
    @IsString()
    readonly id: string;
}
