import { SendVerifyMailReq } from '../../dto/email/request/send-mail.request.dto';
import { SendEmployeeRegistrationMailReq } from '../../dto/email/request/send-employee-registration-mail.request.dto';
import { SendRecoverMailReq } from '../../dto/email/request/send-recover-mail.request.dto';

export abstract class EmailServiceI {
    abstract sendVerifyMail(
        request: SendVerifyMailReq,
    ): Promise<void>;

    abstract sendEmployeeRegistrationMail(
        request: SendEmployeeRegistrationMailReq,
    ): Promise<void>;

    abstract sendRecoverMail(
        request: SendRecoverMailReq,
    ): Promise<void>;
}
