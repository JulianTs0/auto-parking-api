import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { AuthServiceI } from '../core/auth-service.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthEvents } from 'src/auth';
import {
    Errors,
    Role,
    ServiceError,
    Token,
    User,
    UserStatus,
} from 'src/commons';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { UserServiceI } from 'src/users';
import { EventPublisherI } from 'src/app-events';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';
import { RequestOwnerUpgradeReq } from '../../dto/auth/request/request-owner-upgrade-request.dto';
import { UpgradeToOwnerReq } from '../../dto/auth/request/upgrade-to-owner.request.dto';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthServiceI,
        private readonly authHelper: AuthHelper,
        private readonly userService: UserServiceI,
        private readonly eventPublisher: EventPublisherI,
    ) {}

    @Transactional()
    public async register(request: RegisterReq) {
        const existingUser: User | null =
            await this.userService.findUserByEmail(request.email);

        if (existingUser) {
            if (
                existingUser.roles.has(Role.CLIENT) &&
                !existingUser.roles.has(Role.OWNER)
            ) {
                throw new ServiceError(Errors.CLIENT_ALREADY_EXISTS);
            }
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.buildUser(request);

        user.roles = new Set([Role.CLIENT]);
        user.status = UserStatus.PENDING_OWNER;

        await this.userService.saveUser(user);

        return Promise.resolve();
    }

    public async acceptOwnerRequest(
        request: AcceptOwnerRequestReq,
    ): Promise<void> {
        if (!request.authUser.isAdmin()) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        const user: User | null =
            await this.userService.findUserByEmail(
                request.body.ownerEmail,
            );

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        if (user.status !== UserStatus.PENDING_OWNER) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        const token: Token = await this.authHelper.createToken(user);

        await this.eventPublisher.emit(AuthEvents.REGISTER, {
            user: user,
            token,
        });
    }

    public async registerEmployee(
        request: RegisterEmployeeReq,
    ): Promise<void> {
        if (!request.authUser.roles.has(Role.OWNER)) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        const userCheck: User | null =
            await this.userService.findUserByEmail(
                request.body.email,
            );

        if (userCheck) {
            if (!userCheck.roles.has(Role.EMPLOYEE)) {
                userCheck.roles.add(Role.EMPLOYEE);
            }

            await this.userService.updateUser(userCheck);

            return;
        }

        const user: User = await this.authCoreService.buildUser(
            request.body,
        );

        user.roles = new Set([Role.CLIENT, Role.EMPLOYEE]);

        const saved: User = await this.userService.saveUser(user);

        const token: Token = await this.authHelper.createToken(saved);

        await this.eventPublisher.emit(AuthEvents.EMPLOYEE_REGISTER, {
            user: saved,
            token: token,
            ownerFullName: request.authUser.fullName,
            ownerEmail: request.authUser.email,
        });
    }

    @Transactional()
    public async requestOwnerUpgrade(
        request: RequestOwnerUpgradeReq,
    ): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(
                request.body.email,
            );

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        if (!user.roles.has(Role.CLIENT)) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        if (user.roles.has(Role.OWNER)) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        user.status = UserStatus.PENDING_OWNER;

        await this.userService.updateUser(user);
    }

    @Transactional()
    public async upgrade(request: UpgradeToOwnerReq): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(
                request.body.email,
            );

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        if (user.status !== UserStatus.PENDING_OWNER) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        user.roles.add(Role.OWNER);
        user.status = UserStatus.ACTIVE;

        await this.userService.updateUser(user);
    }
}
