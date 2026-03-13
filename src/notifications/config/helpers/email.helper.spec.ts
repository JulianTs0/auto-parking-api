import { Test, TestingModule } from '@nestjs/testing';
import { EmailHelper } from './email.helper';
import { EnvConfigService } from 'src/config/env.service';
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
        configServiceMock = module.get(EnvConfigService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('HTML Template Generation', () => {
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

        it('should generate verification email correctly', () => {
            // Arrange
            const mockToken = 'token';
            const expectedLink =
                'http://mi-frontend.com/verify/token';
            const expectedTemplate = EmailTemplates.VERIFY;

            // Act
            const result = helper.getEmailVerification(mockToken);

            // Assert - readFileSync should be called
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            // Assert - should contain template title
            expect(result).toContain(
                `<h1>${expectedTemplate.title}</h1>`,
            );
            // Assert - should contain template message
            expect(result).toContain(
                `<p>${expectedTemplate.message}</p>`,
            );
            // Assert - should contain expected link with button text
            expect(result).toContain(
                `<a href="${expectedLink}">${expectedTemplate.buttonText}</a>`,
            );
            // Assert - should not contain template placeholders
            expect(result).not.toContain('{{ tittle }}');
            expect(result).not.toContain('{{ message }}');
            expect(result).not.toContain('{{ link }}');
            expect(result).not.toContain('{{ buttonText }}');
        });

        it('should generate password recovery email', () => {
            // Arrange
            const mockToken = 'token';
            const expectedLink =
                'http://mi-frontend.com/recover/token';
            const expectedTemplate = EmailTemplates.RECOVER;

            // Act
            const result =
                helper.getRecoverPasswordRequest(mockToken);

            // Assert - should contain template title
            expect(result).toContain(
                `<h1>${expectedTemplate.title}</h1>`,
            );
            // Assert - should contain expected link with button text
            expect(result).toContain(
                `<a href="${expectedLink}">${expectedTemplate.buttonText}</a>`,
            );
        });

        it('should generate employee registration email adding owner data', () => {
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

            // Assert - should contain owner name
            expect(result).toContain(ownerName);
            // Assert - should contain owner email
            expect(result).toContain(ownerEmail);
        });
    });
});
