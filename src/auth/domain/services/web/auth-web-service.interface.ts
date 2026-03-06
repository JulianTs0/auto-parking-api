import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { RequestOwnerUpgradeReq } from '../../dto/auth/request/request-owner-upgrade-request.dto';
import { UpgradeToOwnerReq } from '../../dto/auth/request/upgrade-to-owner.request.dto';
import { GetOwnerRequestReq } from '../../dto/auth/request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../dto/auth/response/get-owner-request.response.dto';

export abstract class AuthWebServiceI {
    abstract register(request: RegisterReq): Promise<void>;
    abstract acceptOwnerRequest(
        request: AcceptOwnerRequestReq,
    ): Promise<void>;
    abstract registerEmployee(
        request: RegisterEmployeeReq,
    ): Promise<void>;
    abstract requestOwnerUpgrade(
        request: RequestOwnerUpgradeReq,
    ): Promise<void>;
    abstract upgrade(request: UpgradeToOwnerReq): Promise<void>;
    abstract getOwnerRequests(
        request: GetOwnerRequestReq,
    ): Promise<GetOwnerRequestRes>;
}
