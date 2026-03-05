import { User } from 'src/commons';
import { RequestOwnerUpgradeBody } from '../../request/request-owner-upgrade-body.dto';
import { RequestOwnerUpgradeReq } from '../../request/request-owner-upgrade-request.dto';

export class RequestOwnerUpgradeMapper {
    public toRequest(
        authUser: User,
        body: RequestOwnerUpgradeBody,
    ): RequestOwnerUpgradeReq {
        return new RequestOwnerUpgradeReq({
            authUser,
            body,
        });
    }
}
