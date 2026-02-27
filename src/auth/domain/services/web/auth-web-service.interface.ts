import { RegisterReq } from 'src/auth/domain';

export abstract class AuthWebServiceI {
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
    abstract register(request: RegisterReq): Promise<void>;

    abstract registerEmployee(): Promise<void>;
}
