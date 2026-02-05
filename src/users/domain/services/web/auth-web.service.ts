import { AuthReq, AuthRes, RegisterReq } from 'src/users/domain';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../core/auth.service';
import { UserRepository } from 'src/users/data';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthService,
        private readonly userRepository: UserRepository,
    ) { }

    public async auth(request: AuthReq): Promise<AuthRes> {
        return Promise.resolve({} as AuthRes);
    }

    public async register(request: RegisterReq): Promise<void> {
        return Promise.resolve();
    }

    public async resendVerifyEmail(): Promise<void> { }

    public async verifyEmail(): Promise<void> { }

    public async recoverPassword(): Promise<void> { }

    public async changePassword(): Promise<void> { }

    public async registerEmployee(): Promise<void> { }
}
