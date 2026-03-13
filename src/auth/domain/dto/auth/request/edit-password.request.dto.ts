import { User } from 'src/commons';
import { EditPasswordBody } from './edit-password.body.dto';

export class EditPasswordReq {
    readonly authUser: User;

    readonly body: EditPasswordBody;

    constructor(init?: Partial<EditPasswordReq>) {
        Object.assign(this, init);
    }
}
