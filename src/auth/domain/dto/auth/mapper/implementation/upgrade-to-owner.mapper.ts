import { User } from 'src/commons';
import { UpgradeToOwnerBody } from '../../request/upgrade-to-owner.body.dto';
import { UpgradeToOwnerReq } from '../../request/upgrade-to-owner.request.dto';

export class UpgradeToOwnerMapper {
    public toRequest(
        authUser: User,
        body: UpgradeToOwnerBody,
    ): UpgradeToOwnerReq {
        return new UpgradeToOwnerReq({
            authUser,
            body,
        });
    }
}
