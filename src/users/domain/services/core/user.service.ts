import {
    DeleteReq,
    EditReq,
    EditRes,
    GetByIdReq,
    GetByIdRes,
} from 'src/users/domain';
import { UserServiceI } from './user-service.interface';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/users/data';

@Injectable()
export class UserService implements UserServiceI {
    constructor(private readonly userRepository: UserRepository) { }

    public async getById(request: GetByIdReq): Promise<GetByIdRes> {
        return Promise.resolve({} as GetByIdRes);
    }
    public async delete(request: DeleteReq): Promise<void> { }
    public async edit(request: EditReq): Promise<EditRes> {
        return Promise.resolve({} as EditRes);
    }
}
