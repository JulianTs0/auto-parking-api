import { Module } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { EmailService } from './domain/services/core/email.service';
import { EmailHelper } from './config/helpers/email.helper';
import { EmailServiceI } from './domain/services/core/email-service.interface';
import { MAIL_TRANSPORTER } from 'src/commons';
import { EmailSuscriber } from './application/suscribers/email.suscriber';
import { AppConfigModule, EnvConfigService } from 'src/config';

@Module({
    imports: [AppConfigModule],
    providers: [
        {
            provide: MAIL_TRANSPORTER,
            inject: [EnvConfigService],
            useFactory: async (configService: EnvConfigService) => {
                return createTransport({
                    host: configService.mailHost,
                    port: configService.mailPort,
                    secure: false,
                    auth: {
                        user: configService.mailUser,
                        pass: configService.mailPass,
                    },
                });
            },
        },
        EmailHelper,

        EmailService,
        {
            provide: EmailServiceI,
            useExisting: EmailService,
        },
        EmailSuscriber,
    ],
    exports: [MAIL_TRANSPORTER, EmailServiceI, EmailService],
})
export class NotificationsModule {}
