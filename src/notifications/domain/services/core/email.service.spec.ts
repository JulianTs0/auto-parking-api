import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EmailHelper } from '../../../config/helpers/email.helper';
import { EnvConfigService } from 'src/config/env.service';
import { MAIL_TRANSPORTER } from 'src/commons';
import { Transporter } from 'nodemailer';
import {
    createSendEmployeeRegistrationMailReqFixture,
    createSendRecoverMailReqFixture,
    createSendVerifyMailReqFixture,
} from 'test/fixtures';

describe('EmailService', () => {
    let service: EmailService;
    let transporterMock: jest.Mocked<Transporter>;
    let emailHelperMock: jest.Mocked<EmailHelper>;

    const mockSender = 'no-reply@mi-app.com';

    beforeEach(async () => {
        const mockTransporter = {
            sendMail: jest.fn().mockResolvedValue(true),
        } as unknown as jest.Mocked<Transporter>;

        const mockConfigService = {
            mailSender: mockSender,
        };

        const mockEmailHelper = {
            getEmailVerification: jest.fn(),
            getRecoverPasswordRequest: jest.fn(),
            getEmployeeRegister: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: MAIL_TRANSPORTER,
                    useValue: mockTransporter,
                },
                {
                    provide: EnvConfigService,
                    useValue: mockConfigService,
                },
                { provide: EmailHelper, useValue: mockEmailHelper },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        transporterMock = module.get(MAIL_TRANSPORTER);
        emailHelperMock = module.get(EmailHelper);

        jest.clearAllMocks();
    });

    describe('sendVerifyMail()', () => {
        it('debería obtener la plantilla y enviar el correo correctamente', async () => {
            // Arrange
            const mockHtmlTemplate = '<html>Verificar Cuenta</html>';
            emailHelperMock.getEmailVerification.mockReturnValue(
                mockHtmlTemplate,
            );

            // Act
            await service.sendVerifyMail(
                createSendVerifyMailReqFixture(),
            );

            // Assert
            expect(
                emailHelperMock.getEmailVerification,
            ).toHaveBeenCalledWith(
                createSendVerifyMailReqFixture().token.accessToken,
            );

            expect(transporterMock.sendMail).toHaveBeenCalledWith({
                from: mockSender,
                to: createSendVerifyMailReqFixture().to,
                subject: createSendVerifyMailReqFixture().subject,
                html: mockHtmlTemplate,
            });
        });
    });

    describe('sendRecoverMail()', () => {
        it('debería obtener la plantilla de recuperación y enviarla', async () => {
            // Arrange
            const mockHtmlTemplate =
                '<html>Recuperar Password</html>';
            emailHelperMock.getRecoverPasswordRequest.mockReturnValue(
                mockHtmlTemplate,
            );

            // Act
            await service.sendRecoverMail(
                createSendRecoverMailReqFixture(),
            );

            // Assert
            expect(
                emailHelperMock.getRecoverPasswordRequest,
            ).toHaveBeenCalledWith(
                createSendRecoverMailReqFixture().token.accessToken,
            );

            expect(transporterMock.sendMail).toHaveBeenCalledWith({
                from: mockSender,
                to: createSendRecoverMailReqFixture().to,
                subject: createSendRecoverMailReqFixture().subject,
                html: mockHtmlTemplate,
            });
        });
    });

    describe('sendEmployeeRegistrationMail()', () => {
        it('debería obtener la plantilla de empleado y enviarla', async () => {
            // Arrange
            const mockHtmlTemplate = '<html>Registro Empleado</html>';
            emailHelperMock.getEmployeeRegister.mockReturnValue(
                mockHtmlTemplate,
            );

            // Act
            await service.sendEmployeeRegistrationMail(
                createSendEmployeeRegistrationMailReqFixture(),
            );

            // Assert
            expect(
                emailHelperMock.getEmployeeRegister,
            ).toHaveBeenCalledWith(
                createSendEmployeeRegistrationMailReqFixture().token
                    .accessToken,
                createSendEmployeeRegistrationMailReqFixture()
                    .ownerFullName,
                createSendEmployeeRegistrationMailReqFixture()
                    .ownerEmail,
            );

            expect(transporterMock.sendMail).toHaveBeenCalledWith({
                from: mockSender,
                to: createSendEmployeeRegistrationMailReqFixture().to,
                subject:
                    createSendEmployeeRegistrationMailReqFixture()
                        .subject,
                html: mockHtmlTemplate,
            });
        });
    });
});
