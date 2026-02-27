import { AuthServiceI, RegisterReq } from 'src/auth/domain';
import { AuthMobileServiceI } from './auth-mobile-service.interface';
import { Injectable } from '@nestjs/common';
import { UserServiceI } from 'src/users/domain';
import { Errors, Role, ServiceError, Token, User } from 'src/commons';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';

@Injectable()
export class AuthMobileService implements AuthMobileServiceI {
    constructor(
        private readonly authCoreService: AuthServiceI,
        private readonly userService: UserServiceI,
        private readonly authHelper: AuthHelper,
        private readonly eventPublisher: EventPublisherI,
    ) {}

    @Transactional()
    public async register(request: RegisterReq) {
        const emailCheck: boolean =
            await this.userService.existsUserByEmail(request.email);

        if (emailCheck) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.buildUser(request);

        user.roles.add(Role.CLIENT);

        const saved: User = await this.userService.saveUser(user);

        const token: Token = await this.authHelper.createToken(saved);

        this.eventPublisher.emit('auth.mobile.register', {
            user: saved,
            token,
        });

        return Promise.resolve();
    }

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}
}
