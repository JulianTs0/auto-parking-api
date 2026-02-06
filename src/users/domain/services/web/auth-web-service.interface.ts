import { RegisterReq } from 'src/users/domain';

export abstract class AuthWebServiceI {
    abstract register(request: RegisterReq): Promise<void>;
    abstract resendVerifyEmail(): Promise<void>;
    abstract verifyEmail(): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;

    abstract registerEmployee(): Promise<void>;
}
