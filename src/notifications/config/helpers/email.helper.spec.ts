import { Test, TestingModule } from '@nestjs/testing';
import { EmailHelper } from './email.helper';
import { EnvConfigService } from 'src/config';
import * as fs from 'fs';
import { EmailTemplates } from 'src/commons';

jest.mock('fs');

describe('EmailHelper', () => {
    let helper: EmailHelper;
    let configServiceMock: jest.Mocked<EnvConfigService>;

    beforeEach(async () => {
        const mockConfigService = {
            clientUrl: 'http://mi-frontend.com',
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailHelper,
                {
                    provide: EnvConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        helper = module.get<EmailHelper>(EmailHelper);
        configServiceMock = module.get(EnvConfigService) as any;

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Generación de Templates HTML', () => {
        const mockHtmlTemplate = `
            <html>
                <h1>{{ tittle }}</h1>
                <p>{{ message }}</p>
                <a href="{{ link }}">{{ buttonText }}</a>
            </html>
        `;

        beforeEach(() => {
            (fs.readFileSync as jest.Mock).mockReturnValue(
                mockHtmlTemplate,
            );
        });

        it('debería generar el email de verificación correctamente', () => {
            // Arrange
            const mockToken = 'token';
            const expectedLink =
                'http://mi-frontend.com/verify/token';
            const expectedTemplate = EmailTemplates.VERIFY;

            // Act
            const result = helper.getEmailVerification(mockToken);

            // Assert
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);

            expect(result).toContain(
                `<h1>${expectedTemplate.title}</h1>`,
            );
            expect(result).toContain(
                `<p>${expectedTemplate.message}</p>`,
            );
            expect(result).toContain(
                `<a href="${expectedLink}">${expectedTemplate.buttonText}</a>`,
            );

            expect(result).not.toContain('{{ tittle }}');
            expect(result).not.toContain('{{ message }}');
            expect(result).not.toContain('{{ link }}');
            expect(result).not.toContain('{{ buttonText }}');
        });

        it('debería generar el email de recuperación de contraseña', () => {
            // Arrange
            const mockToken = 'token';
            const expectedLink =
                'http://mi-frontend.com/recover/token';
            const expectedTemplate = EmailTemplates.RECOVER;

            // Act
            const result =
                helper.getRecoverPasswordRequest(mockToken);

            // Assert
            expect(result).toContain(
                `<h1>${expectedTemplate.title}</h1>`,
            );
            expect(result).toContain(
                `<a href="${expectedLink}">${expectedTemplate.buttonText}</a>`,
            );
        });

        it('debería generar el email de registro de empleado añadiendo los datos del owner', () => {
            // Arrange
            const mockToken = 'emp-456';
            const ownerName = 'Carlos Gerente';
            const ownerEmail = 'carlos@empresa.com';

            // Act
            const result = helper.getEmployeeRegister(
                mockToken,
                ownerName,
                ownerEmail,
            );

            // Assert
            expect(result).toContain(ownerName);
            expect(result).toContain(ownerEmail);
        });
    });
});
