import {
    AuthMapper,
    AuthReq,
    AuthRes,
    LoginReq,
    LoginRes,
    RegisterReq,
    UserRepositoryI,
} from 'src/users/domain';
import { AuthServiceI } from './auth-service.interface';
import { Injectable } from '@nestjs/common';
import {
    Errors,
    IdGenerator,
    ServiceError,
    Token,
    User,
    UserStatus,
} from 'src/commons';
import { AuthHelper } from 'src/users/config';

@Injectable()
export class AuthService implements AuthServiceI {
    constructor(
        private readonly authHelper: AuthHelper,
        private readonly userRepository: UserRepositoryI,
    ) { }

    public async validateToken(rawToken: string): Promise<User> {
        const token: string | null =
            await this.authHelper.parseToken(rawToken);

        if (token == null)
            throw new ServiceError(Errors.UNAUTHORIZED);

        const id: string = await this.authHelper.getSubject(token);
        const user: User | null =
            await this.userRepository.findById(id);

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);
        if (user.isDeleted())
            throw new ServiceError(Errors.USER_DELETED);
        if (user.isInactive())
            throw new ServiceError(Errors.USER_NOT_ACTIVATED);

        return user;
    }

    public async auth(request: AuthReq): Promise<AuthRes> {
        const user: User = await this.validateToken(
            request.authorization,
        );

        return AuthMapper.auth().toResponse(user);
    }

    public async login(request: LoginReq): Promise<LoginRes> {
        const user: User | null =
            await this.userRepository.findByEmail(request.email);

        if (user == null) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        if (user.isDeleted()) {
            throw new ServiceError(Errors.USER_DELETED);
        }

        if (user.isInactive()) {
            throw new ServiceError(Errors.USER_NOT_ACTIVATED);
        }

        if (
            !this.authHelper.validatePassword(user, request.password)
        ) {
            throw new ServiceError(Errors.INVALID_PASSWORD);
        }

        user.updateAt = new Date();
        const logged: User = await this.userRepository.update(user);

        const token: Token =
            await this.authHelper.createToken(logged);

        return Promise.resolve(AuthMapper.login().toResponse(token));
    }

    public async register(request: RegisterReq): Promise<User> {
        const generatedId: string = IdGenerator.generateUUID();
        const paswordHash: string =
            await this.authHelper.hashPassword(request.password);

        const user: User = new User();
        user.id = generatedId;
        user.fullName = request.fullName;
        user.email = request.email;
        user.passwordHash = paswordHash;
        user.status = UserStatus.INACTIVE;
        user.roles = new Set();
        user.phoneNumber = request.phoneNumber ?? null;
        user.subscriptions = [];
        user.vehicles = [];
        user.paymentMethods = [];
        user.parkingLots = [];

        return user;
    }

    public async resendVerifyEmail(): Promise<void> { }

    public async verifyEmail(): Promise<void> { }

    public async recoverPassword(): Promise<void> { }

    public async changePassword(): Promise<void> { }
}
