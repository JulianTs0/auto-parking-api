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
import { AuthHelper } from 'src/auth/config';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class UserService implements UserServiceI {
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

        return Promise.resolve(UserMapper.getById().toResponse(user));
    }

    @Transactional()
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

    @Transactional()
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

    @Transactional()
    public async saveUser(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    @Transactional()
    public async updateUser(user: User): Promise<User> {
        return await this.userRepository.update(user);
    }
}
