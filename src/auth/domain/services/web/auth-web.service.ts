import { RegisterReq } from 'src/auth/domain';
import { UserServiceI } from 'src/users/domain';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../core/auth.service';
import { Errors, Role, ServiceError, User } from 'src/commons';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthService,
        private readonly userService: UserServiceI,
    ) {}

    @Transactional()
    public async register(request: RegisterReq): Promise<void> {
        const userCheck: boolean =
            await this.userService.existsUserByEmail(request.email);

        if (userCheck) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.register(request);

        user.roles = new Set([
            Role.CLIENT,
            Role.EMPLOYEE,
            Role.OWNER,
        ]);

        const saved: User = await this.userService.saveUser(user);

        return Promise.resolve();
    }

    public async resendVerifyEmail(): Promise<void> {}

    public async verifyEmail(): Promise<void> {}

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}

    public async registerEmployee(): Promise<void> {}
}
