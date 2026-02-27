import { Inject, Injectable } from '@nestjs/common';
import { EmailServiceI } from './email-service.interface';
import { type Transporter } from 'nodemailer';
import { EnvConfigService } from 'src/config/env.service';
import { EmailHelper } from 'src/notifications/config/helpers/email.helper';
import { SendMailReq } from '../../dto/email/request/send-mail.request.dto';
import { ValidateDto } from 'src/commons/decorators/validate-dto.decorator';
import { MAIL_TRANSPORTER } from 'src/commons/const/app.const';

@Injectable()
export class EmailService implements EmailServiceI {
    constructor(
        @Inject(MAIL_TRANSPORTER)
        private readonly transporter: Transporter,
        private readonly configService: EnvConfigService,
        private readonly emailHelper: EmailHelper,
    ) { }

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

    @ValidateDto(SendMailReq)
    public async sendVerifyMail(request: SendMailReq): Promise<void> {
        const template: string =
            this.emailHelper.getEmailVerification(
                request.token.accessToken,
            );

        await this.sendMail(request.to, request.subject, template);

        return Promise.resolve();
    }
}
