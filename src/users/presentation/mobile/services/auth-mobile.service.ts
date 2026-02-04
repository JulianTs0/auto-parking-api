import { AuthReq, AuthRes, RegisterReq } from 'src/users/domain';
import { AuthMobileServiceI } from './auth-mobile-service.interface';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../core/auth.service';
import { UserRepository } from 'src/users/data';
import { ServiceError } from 'src/commons/error/service.error';
import { Errors } from 'src/commons/error/error-type.constants';

@Injectable()
export class AuthMobileService implements AuthMobileServiceI {
    constructor(
        private readonly authCoreService: AuthService,
        private readonly userRepository: UserRepository,
    ) {}

    public async auth(request: AuthReq): Promise<AuthRes> {
        return Promise.resolve({} as AuthRes);
    }

    public async register(request: RegisterReq): Promise<void> {
        const emailCheck = this.userRepository.findByEmail(
            request.email,
        );

        if (emailCheck != null) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        return Promise.resolve();
    }

    public async resendVerifyEmail(): Promise<void> {}

    public async verifyEmail(): Promise<void> {}

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}
}
