import { User } from 'src/commons';
import { RegisterEmployeeBody } from './register-employee-body.dto';

export class RegisterEmployeeReq {
    readonly authUser: User;

    readonly body: RegisterEmployeeBody;

    constructor(init?: Partial<RegisterEmployeeReq>) {
        Object.assign(this, init);
    }
}
