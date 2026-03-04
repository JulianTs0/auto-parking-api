import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../../src/notifications/domain/services/core/email.service';
import { EmailServiceI } from '../../../src/notifications/domain/services/core/email-service.interface';

describe('EmailService (Integration)', () => {
    let service: EmailService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                {
                    provide: EmailServiceI,
                    useValue: {
                        sendVerifyMail: jest.fn(),
                        sendEmployeeRegistrationMail: jest.fn(),
                        sendRecoverMail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
