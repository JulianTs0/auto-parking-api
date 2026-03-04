import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';

export abstract class AuthWebServiceI {
    abstract register(request: RegisterReq): Promise<void>;
    abstract acceptOwnerRequest(
        request: AcceptOwnerRequestReq,
    ): Promise<void>;
    abstract registerEmployee(
        request: RegisterEmployeeReq,
    ): Promise<void>;
}
