import { ApiHideProperty } from '@nestjs/swagger';
import { User } from 'src/commons';
import { RequestOwnerUpgradeBody } from './request-owner-upgrade-body.dto';

export class RequestOwnerUpgradeReq {
    @ApiHideProperty()
    readonly authUser: User;

    @ApiHideProperty()
    readonly body: RequestOwnerUpgradeBody;

    constructor(init?: Partial<RequestOwnerUpgradeReq>) {
        Object.assign(this, init);
    }
}
