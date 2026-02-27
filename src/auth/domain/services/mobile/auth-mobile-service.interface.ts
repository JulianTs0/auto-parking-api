import { RegisterReq } from 'src/auth/domain';

export abstract class AuthMobileServiceI {
    abstract register(request: RegisterReq): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
