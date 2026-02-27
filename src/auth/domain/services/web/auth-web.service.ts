import { AuthServiceI, RegisterReq } from 'src/auth/domain';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { UserServiceI } from 'src/users/domain';
import { Errors, Role, ServiceError, Token, User } from 'src/commons';
import { AuthHelper } from 'src/auth/config/helpers/auth.helper';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';

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

        const saved: User = await this.userService.saveUser(user);

        const token: Token = await this.authHelper.createToken(saved);

        this.eventPublisher.emit('auth.web.register', {
            user: saved,
            token,
        });

        return Promise.resolve();
    }

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}

    public async registerEmployee(): Promise<void> {}
}
