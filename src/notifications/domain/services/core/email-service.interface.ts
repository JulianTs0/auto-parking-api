import { SendMailReq } from '../../dto/email/request/send-mail.request.dto';

export abstract class EmailServiceI {
    abstract sendVerifyMail(request: SendMailReq): Promise<void>;
}
