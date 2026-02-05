import {
    DeleteReq,
    EditReq,
    EditRes,
    GetByIdReq,
    GetByIdRes,
    UserRepositoryI,
} from 'src/users/domain';
import { UserServiceI } from './user-service.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService implements UserServiceI {
    constructor(private readonly userRepository: UserRepositoryI) { }

    public async getById(request: GetByIdReq): Promise<GetByIdRes> {
        return Promise.resolve({} as GetByIdRes);
    }
    public async delete(request: DeleteReq): Promise<void> { }
    public async edit(request: EditReq): Promise<EditRes> {
        return Promise.resolve({} as EditRes);
    }
}
