import { User } from 'src/commons';
import {
    AuthReq,
    AuthRes,
    LoginReq,
    LoginRes,
    RegisterReq,
} from 'src/users/domain';

export abstract class AuthServiceI {
    abstract auth(request: AuthReq): Promise<AuthRes>;
    abstract login(request: LoginReq): Promise<LoginRes>;
    abstract register(request: RegisterReq): Promise<User>;
    abstract resendVerifyEmail(): Promise<void>;
    abstract verifyEmail(): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
