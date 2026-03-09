import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/domain/services/core/auth.service';
import { PasswordEncoderI } from '../../../src/auth/config/providers/password-encoder.interface';
import { TokenHandlerI } from '../../../src/auth/config/providers/token-handler.interface';
import { EmailServiceI } from '../../../src/notifications/domain/services/core/email-service.interface';

describe('AuthService (Integration)', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PasswordEncoderI,
                    useValue: {
                        hash: jest.fn(),
                        compare: jest.fn(),
                    },
                },
                {
                    provide: TokenHandlerI,
                    useValue: {
                        createToken: jest.fn(),
                        verifyToken: jest.fn(),
                        getSubject: jest.fn(),
                        getExpirationDate: jest.fn(),
                    },
                },
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

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
