import { RegisterReq } from '../../dto/auth/request/register.request.dto';

export abstract class AuthMobileServiceI {
    abstract register(request: RegisterReq): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
