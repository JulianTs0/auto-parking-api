import { GetOwnerRequestReq } from '../../dto/users/request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../dto/users/response/get-owner-request.response.dto';

export abstract class UserWebServiceI {
    abstract getOwnerRequests(
        request: GetOwnerRequestReq,
    ): Promise<GetOwnerRequestRes>;
}
