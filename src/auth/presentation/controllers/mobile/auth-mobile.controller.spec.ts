import { Test, TestingModule } from '@nestjs/testing';
import { AuthMobileController } from './auth-mobile.controller'; // Ajustá la ruta
import { AuthMobileServiceI } from '../../../domain/services/mobile/auth-mobile-service.interface';
import { RegisterReq } from '../../../domain/dto/auth/request/register.request.dto';
import { createCreateUserDtoFixture } from 'test/fixtures';

describe('AuthMobileController', () => {
    let controller: AuthMobileController;
    let authMobileServiceMock: jest.Mocked<AuthMobileServiceI>;

    beforeEach(async () => {
        const mockAuthMobileService = {
            register: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthMobileController],
            providers: [
                {
                    provide: AuthMobileServiceI,
                    useValue: mockAuthMobileService,
                },
            ],
        }).compile();

        controller = module.get<AuthMobileController>(
            AuthMobileController,
        );
        authMobileServiceMock = module.get(AuthMobileServiceI);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(controller).toBeDefined();
    });

    describe('create() /register', () => {
        it('debería recibir el RegisterReq, delegar al servicio y no retornar nada', async () => {
            // Arrange
            const request =
                createCreateUserDtoFixture() as RegisterReq;

            authMobileServiceMock.register.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.create(request);

            // Assert
            expect(
                authMobileServiceMock.register,
            ).toHaveBeenCalledWith(request);
            expect(result).toBeUndefined();
        });
    });
});
