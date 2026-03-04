import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { AuthServiceI } from '../core/auth-service.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthEvents } from 'src/auth';
import { Errors, Role, ServiceError, Token, User } from 'src/commons';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { UserServiceI } from 'src/users';
import { EventPublisherI } from 'src/app-events';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';

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
        const userCheck: boolean =
            await this.userService.existsUserByEmail(request.email);

        if (userCheck) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.buildUser(request);

        user.roles = new Set([
            Role.CLIENT,
            Role.EMPLOYEE,
            Role.OWNER,
        ]);

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

        if (!user.isInactive || !user.roles.has(Role.OWNER)) {
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
            // Logica alternativa

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
}
