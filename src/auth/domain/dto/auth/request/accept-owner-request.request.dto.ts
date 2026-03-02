import { ApiHideProperty } from '@nestjs/swagger';
import { User } from 'src/commons';
import { AcceptOwnerRequestBody } from './accept-owner-request.body.dto';

export class AcceptOwnerRequestReq {
    @ApiHideProperty()
    readonly authUser: User;

    @ApiHideProperty()
    readonly body: AcceptOwnerRequestBody;

    constructor(init?: Partial<AcceptOwnerRequestReq>) {
        Object.assign(this, init);
    }
}
