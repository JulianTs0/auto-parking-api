import { RegisterReq } from 'src/auth/domain';
import { UserServiceI } from 'src/users/domain';
import { AuthMobileServiceI } from './auth-mobile-service.interface';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../core/auth.service';
import { Errors, Role, ServiceError, User } from 'src/commons';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class AuthMobileService implements AuthMobileServiceI {
    constructor(
        private readonly authCoreService: AuthService,
        private readonly userService: UserServiceI,
    ) {}

    @Transactional()
    public async register(request: RegisterReq): Promise<void> {
        const emailCheck: boolean =
            await this.userService.existsUserByEmail(request.email);

        if (emailCheck) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.register(request);

        user.roles.add(Role.CLIENT);

        const saved: User = await this.userService.saveUser(user);

        return Promise.resolve();
    }

    public async resendVerifyEmail(): Promise<void> {}

    public async verifyEmail(): Promise<void> {}

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}
}
