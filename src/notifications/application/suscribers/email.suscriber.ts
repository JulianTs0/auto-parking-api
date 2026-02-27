import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServiceI } from 'src/notifications/domain/services/core/email-service.interface';
import { Subjects } from 'src/commons/const/email-template.enum';
import { User, Token } from 'src/commons';

@Injectable()
export class EmailSuscriber {
    constructor(private readonly emailService: EmailServiceI) {}

    @OnEvent('auth.mobile.register', { async: true })
    public async handleUserRegistered(payload: {
        user: User;
        token: Token;
    }) {
        await this.emailService.sendVerifyMail({
            to: payload.user.email,
            subject: Subjects.EMAIL_VALIDATION,
            token: payload.token,
        });
    }
}
