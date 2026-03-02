import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import path from 'path';
import {
    EmailFiles,
    EmailTemplate,
    EmailTemplates,
} from 'src/commons';
import { EnvConfigService } from 'src/config/env.service';

@Injectable()
export class EmailHelper {
    constructor(private readonly configService: EnvConfigService) {}

    public getEmployeeRegister(token: string): string {
        const file: string = EmailFiles.DEFAULT;
        const template: EmailTemplate =
            EmailTemplates.EMPLOYEE_VERIFY;
        const link: string =
            this.configService.serverUrl +
            '/auth/employee/verify' +
            token;

        return this.buildEmailTemplate(file, template, link);
    }

    public getEmailVerification(token: string): string {
        const file: string = EmailFiles.DEFAULT;
        const template: EmailTemplate = EmailTemplates.VERIFY;
        const link: string =
            this.configService.clientUrl + '/verify/' + token;

        return this.buildEmailTemplate(file, template, link);
    }

    public getRecoverPasswordRequest(token: string): string {
        const file: string = EmailFiles.DEFAULT;
        const template: EmailTemplate = EmailTemplates.RECOVER;
        const link: string =
            this.configService.clientUrl + '/recover/' + token;

        return this.buildEmailTemplate(file, template, link);
    }

    private buildEmailTemplate(
        fileName: string,
        payload: EmailTemplate,
        link?: string,
    ): string {
        const templatePath: string = path.join(
            process.cwd(),
            'dist',
            'notifications',
            'templates',
            fileName,
        );

        const altPath: string = path.join(
            __dirname,
            '..',
            'resources',
            fileName,
        );

        let htmlContent: string = readFileSync(altPath, 'utf8');

        htmlContent = htmlContent
            .replace(/\{\{\s*tittle\s*\}\}/g, payload.title)
            .replace(/\{\{\s*message\s*\}\}/g, payload.message)
            .replace(
                /\{\{\s*link\s*\}\}/g,
                link ?? payload.defaultLink,
            )
            .replace(/\{\{\s*buttonText\s*\}\}/g, payload.buttonText);

        return htmlContent;
    }
}
