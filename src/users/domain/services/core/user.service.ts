import { DeleteReq } from '../../dto/users/request/delete.request.dto';
import { EditReq } from '../../dto/users/request/edit.request.dto';
import { EditRes } from '../../dto/users/response/edit.response.dto';
import { GetByIdReq } from '../../dto/users/request/get-by-id.request.dto';
import { GetByIdRes } from '../../dto/users/response/get-by-id.response.dto';
import { UserMapper } from '../../dto/users/mapper/user.mapper';
import { UserRepositoryI } from '../../repository/user-repository.interface';
import {
    UserInternalServiceI,
    UserServiceI,
} from './user-service.interface';
import { Injectable } from '@nestjs/common';
import { Errors, ServiceError, User, UserStatus } from 'src/commons';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';

@Injectable()
export class UserService
    implements UserServiceI, UserInternalServiceI
{
    constructor(
        private readonly userRepository: UserRepositoryI,
        private readonly authHepler: AuthHelper,
    ) {}

    @Transactional()
    public async getById(request: GetByIdReq): Promise<GetByIdRes> {
        const user: User | null = await this.userRepository.findById(
            request.id,
        );

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        return UserMapper.getById().toResponse(user);
    }

    @Transactional()
    public async delete(request: DeleteReq): Promise<void> {
        const user: User | null = await this.userRepository.findById(
            request.id,
        );

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        if (request.authUser.isAdmin()) {
            user.status = UserStatus.BANNED;
        } else if (request.authUser.id === user.id) {
            if (
                !(await this.authHepler.validatePassword(
                    user,
                    request.body.password,
                ))
            ) {
                throw new ServiceError(Errors.FORBIDDEN);
            }
            user.status = UserStatus.DELETED;
        } else {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        await this.userRepository.update(user);
    }

    @Transactional()
    public async edit(request: EditReq): Promise<EditRes> {
        const user: User | null = await this.userRepository.findById(
            request.id,
        );

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        if (user.id !== request.authUser.id)
            throw new ServiceError(Errors.USER_NOT_FOUND);

        user.fullName = request.body.fullName;
        user.phoneNumber = request.body.phoneNumber ?? null;

        const updated: User = await this.userRepository.update(user);

        return UserMapper.edit().toResponse(updated);
    }

    public async findUserById(id: string): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

    public async findUserByEmail(
        email: string,
    ): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }

    public async existsUserByEmail(email: string): Promise<boolean> {
        return await this.userRepository.existsByEmail(email);
    }

    public async saveUser(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    public async updateUser(user: User): Promise<User> {
        return await this.userRepository.update(user);
    }
}
