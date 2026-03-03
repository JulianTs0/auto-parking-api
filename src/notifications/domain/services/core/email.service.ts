import { Inject, Injectable } from '@nestjs/common';
import { EmailServiceI } from './email-service.interface';
import { type Transporter } from 'nodemailer';
import { EmailHelper } from '../../../config/helpers/email.helper';
import { SendVerifyMailReq } from '../../dto/email/request/send-mail.request.dto';
import { SendEmployeeRegistrationMailReq } from '../../dto/email/request/send-employee-registration-mail.request.dto';
import { ValidateDto, MAIL_TRANSPORTER } from 'src/commons';
import { EnvConfigService } from 'src/config';

@Injectable()
export class EmailService implements EmailServiceI {
    constructor(
        @Inject(MAIL_TRANSPORTER)
        private readonly transporter: Transporter,
        private readonly configService: EnvConfigService,
        private readonly emailHelper: EmailHelper,
    ) {}

    private async sendMail(
        to: string,
        subject: string,
        body: string,
    ): Promise<void> {
        await this.transporter.sendMail({
            from: this.configService.mailSender,
            to: to,
            subject: subject,
            html: body,
        });

        return Promise.resolve();
    }

    @ValidateDto(SendVerifyMailReq)
    public async sendVerifyMail(
        request: SendVerifyMailReq,
    ): Promise<void> {
        const template: string =
            this.emailHelper.getEmailVerification(
                request.token.accessToken,
            );

        await this.sendMail(request.to, request.subject, template);

        return Promise.resolve();
    }

    @ValidateDto(SendEmployeeRegistrationMailReq)
    public async sendEmployeeRegistrationMail(
        request: SendEmployeeRegistrationMailReq,
    ): Promise<void> {
        const template: string = this.emailHelper.getEmployeeRegister(
            request.token.accessToken,
            request.ownerFullName,
            request.ownerEmail,
        );

        await this.sendMail(request.to, request.subject, template);

        return Promise.resolve();
    }
}
