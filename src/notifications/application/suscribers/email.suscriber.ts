import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServiceI } from '../../domain/services/core/email-service.interface';
import { Subjects, User, Token } from 'src/commons';

@Injectable()
export class EmailSuscriber {
    constructor(private readonly emailService: EmailServiceI) {}

    @OnEvent('auth.register', { async: true })
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

    @OnEvent('auth.employee.register', { async: true })
    public async handleEmployeeRegistere(payload: {
        user: User;
        token: Token;
        ownerFullName: string;
        ownerEmail: string;
    }) {
        await this.emailService.sendEmployeeRegistrationMail({
            to: payload.user.email,
            subject: Subjects.EMAIL_VALIDATION,
            token: payload.token,
            ownerFullName: payload.ownerFullName,
            ownerEmail: payload.ownerEmail,
        });
    }
}
