import { User } from 'src/commons';
import { AcceptOwnerRequestBody } from '../../request/accept-owner-request.body.dto';
import { AcceptOwnerRequestReq } from '../../request/accept-owner-request.request.dto';

export class AcceptOwnerRequestMapper {
    public toRequest(
        authUser: User,
        body: AcceptOwnerRequestBody,
    ): AcceptOwnerRequestReq {
        return new AcceptOwnerRequestReq({
            authUser,
            body,
        });
    }
}
