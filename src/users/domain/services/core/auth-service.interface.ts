import { AuthReq, AuthRes, RegisterReq } from 'src/users/domain';

export abstract class AuthServiceI {
    abstract auth(request: AuthReq): Promise<AuthRes>;
    abstract register(request: RegisterReq): Promise<void>;
    abstract resendVerifyEmail(): Promise<void>;
    abstract verifyEmail(): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
