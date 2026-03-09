import { Test, TestingModule } from '@nestjs/testing';
import { EmailSuscriber } from './email.suscriber';
import { EmailServiceI } from '../../domain/services/core/email-service.interface';
import { Subjects } from '../../../commons/const/email-template.const';
import { Token } from '../../../commons/dto/token.dto';
import { User } from '../../../commons/entity/user.entity';

describe('EmailSuscriber', () => {
    let suscriber: EmailSuscriber;
    let emailServiceMock: jest.Mocked<EmailServiceI>;

    beforeEach(async () => {
        const emailServiceTemplateMock = {
            sendVerifyMail: jest.fn(),
            sendEmployeeRegistrationMail: jest.fn(),
            sendRecoverMail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailSuscriber,
                {
                    provide: EmailServiceI,
                    useValue: emailServiceTemplateMock,
                },
            ],
        }).compile();

        suscriber = module.get<EmailSuscriber>(EmailSuscriber);

        emailServiceMock = module.get(EmailServiceI);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(suscriber).toBeDefined();
    });

    describe('handleUserRegistered()', () => {
        it('debería pasarle el payload al sendVerifyMail del emailService', async () => {
            // Arrange

            const mockPayload = {
                user: { email: 'usuario@correo.com' } as User,
                token: { accessToken: 'abc-123' } as Token,
            };

            // Act
            await suscriber.handleUserRegistered(mockPayload);

            // Assert
            expect(
                emailServiceMock.sendVerifyMail,
            ).toHaveBeenCalledTimes(1);
            expect(
                emailServiceMock.sendVerifyMail,
            ).toHaveBeenCalledWith({
                to: mockPayload.user.email,
                subject: Subjects.EMAIL_VALIDATION,
                token: mockPayload.token,
            });
        });
    });

    describe('handlePassowrdRecover()', () => {
        it('debería pasarle el payload al sendRecoverMail del emailService', async () => {
            // Arrange

            const mockPayload = {
                user: { email: 'empleado@correo.com' } as User,
                token: { accessToken: 'xyz-987' } as Token,
            };

            // Act

            await suscriber.handlePassowrdRecover(mockPayload);

            // Assert

            expect(
                emailServiceMock.sendRecoverMail,
            ).toHaveBeenCalledTimes(1);
            expect(
                emailServiceMock.sendRecoverMail,
            ).toHaveBeenCalledWith({
                to: mockPayload.user.email,
                subject: Subjects.RECOVER_PASSWORD,
                token: mockPayload.token,
            });
        });
    });

    describe('handleEmployeeRegistere()', () => {
        it('debería pasarle el payload al sendRecoverMail del emailService', async () => {
            // Arrange

            const mockPayload = {
                user: { email: 'empleado@correo.com' } as User,
                token: { accessToken: 'xyz-987' } as Token,
                ownerFullName: 'Juan Pérez',
                ownerEmail: 'juan@empresa.com',
            };

            // Act

            await suscriber.handleEmployeeRegistere(mockPayload);

            // Assert
            expect(
                emailServiceMock.sendEmployeeRegistrationMail,
            ).toHaveBeenCalledTimes(1);
            expect(
                emailServiceMock.sendEmployeeRegistrationMail,
            ).toHaveBeenCalledWith({
                to: mockPayload.user.email,
                subject: Subjects.EMAIL_VALIDATION,
                token: mockPayload.token,
                ownerFullName: mockPayload.ownerFullName,
                ownerEmail: mockPayload.ownerEmail,
            });
        });
    });
});
