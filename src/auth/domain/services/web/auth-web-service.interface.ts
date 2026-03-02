import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';

export abstract class AuthWebServiceI {
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
    abstract register(request: RegisterReq): Promise<void>;
    abstract acceptOwnerRequest(
        request: AcceptOwnerRequestReq,
    ): Promise<void>;

    abstract registerEmployee(): Promise<void>;
}
