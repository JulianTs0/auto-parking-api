import { User } from 'src/commons';
import { EditBody } from './edit.body.dto';

export class EditReq {
    readonly authUser: User;

    readonly id: string;

    readonly body: EditBody;

    constructor(init?: Partial<EditReq>) {
        Object.assign(this, init);
    }
}
