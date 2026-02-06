import { RegisterReq, UserRepositoryI } from 'src/users/domain';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../core/auth.service';
import { Errors, Role, ServiceError, User } from 'src/commons';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthService,
        private readonly userRepository: UserRepositoryI,
    ) {}

    public async register(request: RegisterReq): Promise<void> {
        const userCheck: User | null =
            await this.userRepository.findByEmail(request.email);

        if (userCheck != null) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.register(request);

        user.roles = new Set([
            Role.CLIENT,
            Role.EMPLOYEE,
            Role.OWNER,
        ]);

        const saved: User = await this.userRepository.save(user);

        return Promise.resolve();
    }

    public async resendVerifyEmail(): Promise<void> {}

    public async verifyEmail(): Promise<void> {}

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}

    public async registerEmployee(): Promise<void> {}
}
