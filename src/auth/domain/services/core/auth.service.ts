import { AuthServiceI } from './auth-service.interface';
import { Injectable } from '@nestjs/common';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { Transactional } from '@nestjs-cls/transactional';
import { VerifyEmailReq } from '../../dto/auth/request/verify-email.request.dto';
import { AuthRes } from '../../dto/auth/response/auth.response.dto';
import { AuthReq } from '../../dto/auth/request/auth.request.dto';
import { AuthMapper } from '../../dto/auth/mapper/auth.mapper';
import { LoginReq } from '../../dto/auth/request/login.request.dto';
import { LoginRes } from '../../dto/auth/response/login.response.dto';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { UserServiceI } from 'src/users';
import { AuthEvents } from 'src/auth';
import { EventPublisherI } from 'src/app-events';
import {
    Errors,
    IdGenerator,
    ServiceError,
    Token,
    User,
    UserStatus,
} from 'src/commons';
import { RecoverPasswordReq } from '../../dto/auth/request/recover-password.request.dto';
import { EditPasswordReq } from '../../dto/auth/request/edit-password.request.dto';
import { ResendEmailReq } from '../../dto/auth/request/resend-email.request.dto';

@Injectable()
export class AuthService implements AuthServiceI {
    constructor(
        private readonly authHelper: AuthHelper,
        private readonly userService: UserServiceI,
        private readonly eventPublisher: EventPublisherI,
    ) { }

    @Transactional()
    public async validateToken(rawToken: string): Promise<User> {
        const token: string | null =
            await this.authHelper.parseToken(rawToken);

        if (token == null)
            throw new ServiceError(Errors.UNAUTHORIZED);

        const id: string = await this.authHelper.getSubject(token);
        const user: User | null =
            await this.userService.findUserById(id);

        if (user == null)
            throw new ServiceError(Errors.USER_NOT_FOUND);
        if (user.isDeleted())
            throw new ServiceError(Errors.USER_DELETED);
        if (user.isInactive())
            throw new ServiceError(Errors.USER_NOT_ACTIVATED);

        return user;
    }

    @Transactional()
    public async auth(request: AuthReq): Promise<AuthRes> {
        const user: User = await this.validateToken(
            request.authorization,
        );

        return AuthMapper.auth().toResponse(user);
    }

    @Transactional()
    public async login(request: LoginReq): Promise<LoginRes> {
        const user: User | null =
            await this.userService.findUserByEmail(request.email);

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
            !(await this.authHelper.validatePassword(
                user,
                request.password,
            ))
        ) {
            throw new ServiceError(Errors.INVALID_PASSWORD);
        }

        user.updateAt = new Date();
        const logged: User = await this.userService.updateUser(user);

        const token: Token =
            await this.authHelper.createToken(logged);

        return Promise.resolve(AuthMapper.login().toResponse(token));
    }

    public async buildUser(request: RegisterReq): Promise<User> {
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

    @Transactional()
    public async resendVerifyEmail(
        request: ResendEmailReq,
    ): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(request.email);

        if (!user) return;

        if (user.isActive()) {
            throw new ServiceError(Errors.USER_ALREADY_ACTIVATED);
        }

        const token: Token = await this.authHelper.createToken(user);

        await this.eventPublisher.emit(AuthEvents.REGISTER, {
            user: user,
            token,
        });
    }

    @Transactional()
    public async verifyEmail(request: VerifyEmailReq): Promise<void> {
        const token: string | null = await this.authHelper.parseToken(
            request.token,
            true,
        );

        if (!token) {
            throw new ServiceError(Errors.UNAUTHORIZED);
        }

        const id: string = await this.authHelper.getSubject(token);
        const user: User | null =
            await this.userService.findUserById(id);

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }
        if (user.status == UserStatus.ACTIVE) {
            throw new ServiceError(Errors.USER_ALREADY_ACTIVATED);
        }

        user.status = UserStatus.ACTIVE;

        this.userService.updateUser(user);
    }

    @Transactional()
    public async recoverPassword(
        request: RecoverPasswordReq,
    ): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(request.email);

        if (!user || user.status != UserStatus.ACTIVE) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        const token: Token = await this.authHelper.createToken(user);

        await this.eventPublisher.emit(AuthEvents.RECOVER_PASSWORD, {
            user: user,
            token: token,
        });
    }

    @Transactional()
    public async changePassword(
        request: EditPasswordReq,
    ): Promise<void> {
        const user: User = request.authUser;

        user.passwordHash = await this.authHelper.hashPassword(
            request.body.newPassword,
        );

        await this.userService.updateUser(user);
    }
}
