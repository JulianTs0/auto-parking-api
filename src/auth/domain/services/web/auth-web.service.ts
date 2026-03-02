import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { AuthServiceI } from '../core/auth-service.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Errors, Role, ServiceError, Token, User } from 'src/commons';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { UserServiceI } from 'src/users';
import { EventPublisherI } from 'src/app-events';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthServiceI,
        private readonly authHelper: AuthHelper,
        private readonly userService: UserServiceI,
        private readonly eventPublisher: EventPublisherI,
    ) { }

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

        if (!user.isInactive || user.roles.has(Role.OWNER)) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        const token: Token = await this.authHelper.createToken(user);

        await this.eventPublisher.emit('auth.register', {
            user: user,
            token,
        });
    }

    public async recoverPassword(): Promise<void> { }

    public async changePassword(): Promise<void> { }

    public async registerEmployee(): Promise<void> { }
}
