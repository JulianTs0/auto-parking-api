import { AuthReq, AuthRes, RegisterReq } from 'src/users/domain';

export abstract class AuthServiceI {
    abstract auth(request: AuthReq): Promise<AuthRes>;
    abstract register(request: RegisterReq): Promise<RegisterReq>;
    abstract resendVerifyEmail(): void;
    abstract verifyEmail(): void;
    abstract recoverPassword(): void;
    abstract changePassword(): void;
}
