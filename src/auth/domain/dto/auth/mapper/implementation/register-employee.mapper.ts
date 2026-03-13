import { User } from '../../../../../../commons';
import { RegisterEmployeeBody } from '../../request/register-employee-body.dto';
import { RegisterEmployeeReq } from '../../request/register-employee.request.dto';

export class RegisterEmployeeMapper {
    public toRequest(
        body: RegisterEmployeeBody,
        authUser: User,
    ): RegisterEmployeeReq {
        const request = new RegisterEmployeeReq({
            body: body,
            authUser: authUser,
        });

        return request;
    }
}
