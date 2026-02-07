import {
    DeleteReq,
    EditReq,
    EditRes,
    GetByIdReq,
    GetByIdRes,
    UserMapper,
    UserRepositoryI,
} from 'src/users/domain';
import { UserServiceI } from './user-service.interface';
import { Injectable } from '@nestjs/common';
import { Errors, ServiceError, User, UserStatus } from 'src/commons';
import { AuthHelper } from 'src/users/config';

@Injectable()
export class UserService implements UserServiceI {
    constructor(
        private readonly userRepository: UserRepositoryI,
        private readonly authHepler: AuthHelper,
    ) { }

    public async getById(request: GetByIdReq): Promise<GetByIdRes> {
        const user: User | null = await this.userRepository.findById(
            request.id,
        );

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        return Promise.resolve(UserMapper.getById().toResponse(user));
    }

    public async delete(request: DeleteReq): Promise<void> {
        const user: User | null = await this.userRepository.findById(
            request.id,
        );

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        if (request.user.isAdmin()) {
            user.status = UserStatus.BANNED;
        } else if (request.user.id === user.id) {
            if (
                !(await this.authHepler.validatePassword(
                    user,
                    request.password,
                ))
            ) {
                throw new ServiceError(Errors.FORBIDDEN);
            }
            user.status = UserStatus.DELETED;
        } else {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        await this.userRepository.update(user);

        return Promise.resolve();
    }

    public async edit(request: EditReq): Promise<EditRes> {
        const user: User | null = await this.userRepository.findById(
            request.id,
        );

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        if (user.id !== request.user.id)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        user.fullName = request.fullName;
        user.phoneNumber = request.phoneNumber ?? null;

        const updated: User = await this.userRepository.update(user);

        return Promise.resolve(UserMapper.edit().toResponse(updated));
    }
}
