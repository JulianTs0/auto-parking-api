import { User } from 'src/commons';
import { UpgradeToOwnerBody } from './upgrade-to-owner.body.dto';

export class UpgradeToOwnerReq {
    readonly authUser: User;

    readonly body: UpgradeToOwnerBody;

    constructor(init?: Partial<UpgradeToOwnerReq>) {
        Object.assign(this, init);
    }
}
