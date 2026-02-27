import { User } from 'src/commons';
import {
    AuthReq,
    AuthRes,
    LoginReq,
    LoginRes,
    RegisterReq,
} from 'src/auth/domain';
import { VerifyEmailReq } from '../../dto/auth/request/verify-email.request.dto';

export abstract class AuthServiceI {
    abstract auth(request: AuthReq): Promise<AuthRes>;
    abstract validateToken(rawToken: string): Promise<User>;
    abstract login(request: LoginReq): Promise<LoginRes>;
    abstract buildUser(request: RegisterReq): Promise<User>;
    abstract resendVerifyEmail(): Promise<void>;
    abstract verifyEmail(request: VerifyEmailReq): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
