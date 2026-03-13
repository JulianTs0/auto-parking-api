import { Test, TestingModule } from '@nestjs/testing';
import { AuthMobileService } from './auth-mobile.service';
import { AuthServiceI } from '../core/auth-service.interface';
import { UserInternalServiceI } from '../../../../users/domain/services/core/user-service.interface';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { EventPublisherI } from '../../../../app-events/services/event-publisher.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthEvents } from '../../../config/utils/auth-events.enum';
import { Errors } from '../../../../commons/error/error-type.constants';
import { Role } from '../../../../commons/const/role.enum';
import { ServiceError } from '../../../../commons/error/service.error';
import { Token } from '../../../../commons/dto/token.dto';
import { User } from '../../../../commons/entity/user.entity';
import { createCreateUserDtoFixture } from 'test/fixtures/auth.fixtures';
import { createUserFixture } from 'test/fixtures/auth.fixtures';

jest.mock('@nestjs-cls/transactional', () => ({
    Transactional: () => {
        return (
            target: any,
            propertyKey: string,
            descriptor: PropertyDescriptor,
        ) => {
            return descriptor;
        };
    },
}));

describe('AuthMobileService', () => {
    let service: AuthMobileService;
    let authCoreServiceMock: jest.Mocked<AuthServiceI>;
    let userServiceMock: jest.Mocked<UserInternalServiceI>;
    let authHelperMock: jest.Mocked<AuthHelper>;
    let eventPublisherMock: jest.Mocked<EventPublisherI>;

    beforeAll(async () => {
        const mockAuthCoreService = { buildUser: jest.fn() };
        const mockUserService = {
            existsUserByEmail: jest.fn(),
            saveUser: jest.fn(),
        };
        const mockAuthHelper = { createToken: jest.fn() };
        const mockEventPublisher = { emit: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthMobileService,
                {
                    provide: AuthServiceI,
                    useValue: mockAuthCoreService,
                },
                {
                    provide: UserInternalServiceI,
                    useValue: mockUserService,
                },
                {
                    provide: AuthHelper,
                    useValue: mockAuthHelper,
                },
                {
                    provide: EventPublisherI,
                    useValue: mockEventPublisher,
                },
            ],
        }).compile();

        service = module.get<AuthMobileService>(AuthMobileService);
        authCoreServiceMock = module.get(AuthServiceI);
        userServiceMock = module.get(UserInternalServiceI);
        authHelperMock = module.get(AuthHelper);
        eventPublisherMock = module.get(EventPublisherI);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register()', () => {
        it('should throw EMAIL_ALREADY_EXISTS if email is already registered', async () => {
            // Arrange
            const request =
                createCreateUserDtoFixture() as RegisterReq;

            userServiceMock.existsUserByEmail.mockResolvedValue(true);

            // Act
            const result = service.register(request);

            // Assert - should throw EMAIL_ALREADY_EXISTS error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.EMAIL_ALREADY_EXISTS),
            );
            // Assert - buildUser should not be called
            expect(
                authCoreServiceMock.buildUser,
            ).not.toHaveBeenCalled();
        });

        it('should register user, assign CLIENT role and emit event (happy path)', async () => {
            // Arrange
            const request =
                createCreateUserDtoFixture() as RegisterReq;

            const builtUser = createUserFixture({
                roles: new Set(),
            }) as unknown as User;

            const mockToken = { accessToken: 'jwt-token' } as Token;

            userServiceMock.existsUserByEmail.mockResolvedValue(
                false,
            );
            authCoreServiceMock.buildUser.mockResolvedValue(
                builtUser,
            );
            userServiceMock.saveUser.mockResolvedValue(builtUser);
            authHelperMock.createToken.mockResolvedValue(mockToken);

            // Act
            await service.register(request);

            // Assert - user should have CLIENT role
            expect(builtUser.roles.has(Role.CLIENT)).toBe(true);
            // Assert - saveUser should be called
            expect(userServiceMock.saveUser).toHaveBeenCalledWith(
                builtUser,
            );
            // Assert - event should be emitted
            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.REGISTER,
                {
                    user: builtUser,
                    token: mockToken,
                },
            );
        });
    });
});
