import { User } from 'src/commons';
import { DeleteBody } from './delete.body.dto';

export class DeleteReq {
    readonly authUser: User;

    readonly id: string;

    readonly body: DeleteBody;

    constructor(init?: Partial<DeleteReq>) {
        Object.assign(this, init);
    }
}
