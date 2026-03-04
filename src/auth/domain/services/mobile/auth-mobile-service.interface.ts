import { RegisterReq } from '../../dto/auth/request/register.request.dto';

export abstract class AuthMobileServiceI {
    abstract register(request: RegisterReq): Promise<void>;
}
