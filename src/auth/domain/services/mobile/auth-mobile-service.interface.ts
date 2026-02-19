import { RegisterReq } from 'src/auth/domain';

export abstract class AuthMobileServiceI {
    abstract register(request: RegisterReq): Promise<void>;
    abstract resendVerifyEmail(): Promise<void>;
    abstract verifyEmail(): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
