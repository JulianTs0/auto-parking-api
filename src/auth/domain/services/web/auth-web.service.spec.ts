import { Test, TestingModule } from '@nestjs/testing';
import { UserInternalServiceI } from 'src/users/domain/services/core/user-service.interface';
import { OwnerRequestInternalServiceI } from 'src/users/domain/services/core/owner-request-service.interface';
import { OwnerRequestLoadProfile } from 'src/users/persistance/datasource/data/postgres/profiles/owner-request-load.profile';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';
import {
    Errors,
    IdGenerator,
    PageContent,
    Role,
    ServiceError,
    Token,
    User,
    UserStatus,
    OwnerRequest,
    OwnerRequestStatus,
} from 'src/commons';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';
import { RequestOwnerUpgradeReq } from '../../dto/auth/request/request-owner-upgrade-request.dto';
import { UpgradeToOwnerReq } from '../../dto/auth/request/upgrade-to-owner.request.dto';
import { GetOwnerRequestReq } from '../../dto/auth/request/get-owner-request.request.dto';
import { AuthWebService } from './auth-web.service';
import { AuthServiceI } from '../core/auth-service.interface';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import {
    createCreateUserDtoFixture,
    createOwnerUserFixture,
    createUserFixture,
} from 'test/fixtures';
import { AuthEvents } from 'src/auth/config/utils/auth-events.enum';

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

describe('AuthWebService', () => {
    let service: AuthWebService;
    let authCoreServiceMock: jest.Mocked<AuthServiceI>;
    let authHelperMock: jest.Mocked<AuthHelper>;
    let userServiceMock: jest.Mocked<UserInternalServiceI>;
    let ownerRequestServiceMock: jest.Mocked<OwnerRequestInternalServiceI>;
    let eventPublisherMock: jest.Mocked<EventPublisherI>;

    beforeAll(async () => {
        const mockAuthCoreService = { buildUser: jest.fn() };
        const mockAuthHelper = { createToken: jest.fn() };
        const mockUserService = {
            findUserByEmail: jest.fn(),
            saveUser: jest.fn(),
            updateUser: jest.fn(),
        };
        const mockOwnerRequestService = {
            save: jest.fn(),
            update: jest.fn(),
            findPendingByUserId: jest.fn(),
            findByUserId: jest.fn(),
            findRequestsPaginated: jest.fn(),
        };
        const mockEventPublisher = { emit: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthWebService,
                {
                    provide: AuthServiceI,
                    useValue: mockAuthCoreService,
                },
                { provide: AuthHelper, useValue: mockAuthHelper },
                {
                    provide: UserInternalServiceI,
                    useValue: mockUserService,
                },
                {
                    provide: OwnerRequestInternalServiceI,
                    useValue: mockOwnerRequestService,
                },
                {
                    provide: EventPublisherI,
                    useValue: mockEventPublisher,
                },
            ],
        }).compile();

        service = module.get<AuthWebService>(AuthWebService);
        authCoreServiceMock = module.get(AuthServiceI);
        authHelperMock = module.get(AuthHelper);
        userServiceMock = module.get(UserInternalServiceI);
        ownerRequestServiceMock = module.get(
            OwnerRequestInternalServiceI,
        );
        eventPublisherMock = module.get(EventPublisherI);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register()', () => {
        it('should throw CLIENT_ALREADY_EXISTS if user has CLIENT role but not OWNER', async () => {
            // Arrange
            const existingUser =
                createUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingUser,
            );
            const request = {
                email: existingUser.email,
            } as RegisterReq;

            // Act
            const result = service.register(request);

            // Assert - should throw CLIENT_ALREADY_EXISTS error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.CLIENT_ALREADY_EXISTS),
            );
        });

        it('should throw EMAIL_ALREADY_EXISTS if user exists and has OWNER role', async () => {
            // Arrange
            const existingOwner =
                createOwnerUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingOwner,
            );
            const request = {
                email: existingOwner.email,
            } as RegisterReq;

            // Act
            const result = service.register(request);

            // Assert - should throw EMAIL_ALREADY_EXISTS error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.EMAIL_ALREADY_EXISTS),
            );
        });

        it('should register user, assign CLIENT role, INACTIVE status and create OwnerRequest (happy path)', async () => {
            // Arrange
            const requestDto = createCreateUserDtoFixture();
            const request = requestDto as RegisterReq;

            const builtUser = createUserFixture({
                status: UserStatus.INACTIVE,
                roles: new Set(),
            }) as unknown as User;

            const savedUser = {
                ...builtUser,
                id: 'saved-uuid-123',
            } as User;

            jest.spyOn(IdGenerator, 'generateUUID').mockReturnValue(
                'uuid-request-123',
            );
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            authCoreServiceMock.buildUser.mockResolvedValue(
                builtUser,
            );
            userServiceMock.saveUser.mockResolvedValue(savedUser);

            // Act
            await service.register(request);

            // Assert - user should have CLIENT role
            expect(builtUser.roles.has(Role.CLIENT)).toBe(true);
            // Assert - user status should be INACTIVE
            expect(builtUser.status).toBe(UserStatus.INACTIVE);
            // Assert - saveUser should be called
            expect(userServiceMock.saveUser).toHaveBeenCalledWith(
                builtUser,
            );
            // Assert - owner request should be saved
            expect(ownerRequestServiceMock.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'uuid-request-123',
                    user: savedUser,
                    status: OwnerRequestStatus.PENDING,
                }),
            );
        });
    });

    describe('acceptOwnerRequest()', () => {
        it('should throw USER_NOT_FOUND if owner does not exist by email', async () => {
            // Arrange
            const reqEmail = createOwnerUserFixture().email;
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            const request = {
                body: { ownerEmail: reqEmail },
            } as unknown as AcceptOwnerRequestReq;

            // Act
            const result = service.acceptOwnerRequest(request);

            // Assert - should throw USER_NOT_FOUND error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('should approve request, generate token and emit event (happy path)', async () => {
            // Arrange
            const mockUser =
                createOwnerUserFixture() as unknown as User;
            const mockOwnerReq = {
                user: mockUser,
                status: OwnerRequestStatus.PENDING,
            } as OwnerRequest;
            const mockToken = {
                accessToken: 'jwt-token-valid',
            } as Token;

            userServiceMock.findUserByEmail.mockResolvedValue(
                mockUser,
            );
            ownerRequestServiceMock.findPendingByUserId.mockResolvedValue(
                mockOwnerReq,
            );
            authHelperMock.createToken.mockResolvedValue(mockToken);

            const request = {
                body: { ownerEmail: mockUser.email },
            } as unknown as AcceptOwnerRequestReq;

            // Act
            await service.acceptOwnerRequest(request);

            // Assert - request status should be APPROVED
            expect(mockOwnerReq.status).toBe(
                OwnerRequestStatus.APPROVED,
            );
            // Assert - update should be called
            expect(
                ownerRequestServiceMock.update,
            ).toHaveBeenCalledWith(mockOwnerReq);
            // Assert - token should be created
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            // Assert - event should be emitted
            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.REGISTER,
                {
                    user: mockUser,
                    token: mockToken,
                },
            );
        });
    });

    describe('registerEmployee()', () => {
        it('should update roles and not emit event if user already exists', async () => {
            // Arrange
            // Common client fixture
            const existingUser =
                createUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingUser,
            );

            const request = {
                body: {
                    email: existingUser.email,
                },
            } as unknown as RegisterEmployeeReq;

            // Act
            await service.registerEmployee(request);

            // Assert - user should have EMPLOYEE role added
            expect(existingUser.roles.has(Role.EMPLOYEE)).toBe(true);
            // Assert - updateUser should be called
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                existingUser,
            );
            // Assert - saveUser should not be called
            expect(userServiceMock.saveUser).not.toHaveBeenCalled();
            // Assert - event should not be emitted
            expect(eventPublisherMock.emit).not.toHaveBeenCalled();
        });

        it('should build user, assign CLIENT+EMPLOYEE roles, save and emit event if new (happy path)', async () => {
            // Arrange
            const requestDto = createCreateUserDtoFixture();
            const mockOwner = createOwnerUserFixture();

            const request = {
                body: requestDto,
                authUser: mockOwner,
            } as unknown as RegisterEmployeeReq;

            const builtUser = createUserFixture({
                roles: new Set(),
            }) as unknown as User;
            const savedUser = {
                ...builtUser,
                id: 'uuid-new-employee',
            } as User;
            const mockToken = {
                accessToken: 'jwt-employee',
            } as Token;

            userServiceMock.findUserByEmail.mockResolvedValue(null);
            authCoreServiceMock.buildUser.mockResolvedValue(
                builtUser,
            );
            userServiceMock.saveUser.mockResolvedValue(savedUser);
            authHelperMock.createToken.mockResolvedValue(mockToken);

            // Act
            await service.registerEmployee(request);

            // Assert - user should have CLIENT role
            expect(builtUser.roles.has(Role.CLIENT)).toBe(true);
            // Assert - user should have EMPLOYEE role
            expect(builtUser.roles.has(Role.EMPLOYEE)).toBe(true);
            // Assert - saveUser should be called
            expect(userServiceMock.saveUser).toHaveBeenCalledWith(
                builtUser,
            );
            // Assert - event should be emitted
            expect(eventPublisherMock.emit).toHaveBeenCalledWith(
                AuthEvents.EMPLOYEE_REGISTER,
                {
                    user: savedUser,
                    token: mockToken,
                    ownerFullName: mockOwner.fullName,
                    ownerEmail: mockOwner.email,
                },
            );
        });
    });

    describe('requestOwnerUpgrade()', () => {
        it('should throw USER_NOT_FOUND if user does not exist', async () => {
            // Arrange
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            const request = {
                body: { email: 'no-existe@test.com' },
            } as unknown as RequestOwnerUpgradeReq;

            // Act
            const result = service.requestOwnerUpgrade(request);

            // Assert - should throw USER_NOT_FOUND error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('should throw EMAIL_ALREADY_EXISTS if user already has OWNER role', async () => {
            // Arrange
            const existingOwner =
                createOwnerUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingOwner,
            );
            const request = {
                body: {
                    email: existingOwner.email,
                },
            } as unknown as RequestOwnerUpgradeReq;

            // Act
            const result = service.requestOwnerUpgrade(request);

            // Assert - should throw EMAIL_ALREADY_EXISTS error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.EMAIL_ALREADY_EXISTS),
            );
        });

        it('should throw OWNER_REQUEST_ALREADY_EXISTS if user already has pending request', async () => {
            // Arrange
            const existingUser =
                createUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingUser,
            );
            ownerRequestServiceMock.findPendingByUserId.mockResolvedValue(
                {
                    id: 'req-123',
                } as OwnerRequest,
            );

            const request = {
                body: {
                    email: existingUser.email,
                },
            } as unknown as RequestOwnerUpgradeReq;

            // Act
            const result = service.requestOwnerUpgrade(request);

            // Assert - should throw OWNER_REQUEST_ALREADY_EXISTS error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.OWNER_REQUEST_ALREADY_EXISTS),
            );
        });

        it('should generate and save new OwnerRequest with PENDING status (happy path)', async () => {
            // Arrange
            const existingUser =
                createUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingUser,
            );
            ownerRequestServiceMock.findPendingByUserId.mockResolvedValue(
                null,
            );

            jest.spyOn(IdGenerator, 'generateUUID').mockReturnValue(
                'req-uuid-999',
            );

            const request = {
                body: {
                    email: existingUser.email,
                },
            } as unknown as RequestOwnerUpgradeReq;

            // Act
            await service.requestOwnerUpgrade(request);

            // Assert - save should be called with correct data
            expect(ownerRequestServiceMock.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'req-uuid-999',
                    user: existingUser,
                    status: OwnerRequestStatus.PENDING,
                }),
            );
        });
    });

    describe('upgrade()', () => {
        it('should throw USER_NOT_FOUND if user does not exist', async () => {
            // Arrange
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            const request = {
                body: {
                    email: 'no-existe@test.com',
                },
            } as unknown as UpgradeToOwnerReq;

            // Act
            const result = service.upgrade(request);

            // Assert - should throw USER_NOT_FOUND error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('should throw OWNER_REQUEST_NOT_FOUND if there is no request or it is not APPROVED', async () => {
            // Arrange
            const existingUser =
                createUserFixture() as unknown as User;
            userServiceMock.findUserByEmail.mockResolvedValue(
                existingUser,
            );

            const badRequest = {
                status: OwnerRequestStatus.PENDING,
            } as OwnerRequest;
            ownerRequestServiceMock.findByUserId.mockResolvedValue(
                badRequest,
            );

            const request = {
                body: {
                    email: existingUser.email,
                },
            } as unknown as UpgradeToOwnerReq;

            // Act
            const result = service.upgrade(request);

            // Assert - should throw OWNER_REQUEST_NOT_FOUND error
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.OWNER_REQUEST_NOT_FOUND),
            );
        });

        it('should add OWNER role, activate user and mark request as COMPLETED (happy path)', async () => {
            // Arrange
            const existingUser =
                createUserFixture() as unknown as User;
            const validReq = {
                status: OwnerRequestStatus.APPROVED,
            } as OwnerRequest;

            userServiceMock.findUserByEmail.mockResolvedValue(
                existingUser,
            );
            ownerRequestServiceMock.findByUserId.mockResolvedValue(
                validReq,
            );

            const request = {
                body: { email: existingUser.email },
            } as unknown as UpgradeToOwnerReq;

            // Act
            await service.upgrade(request);

            // Assert - user should have OWNER role
            expect(existingUser.roles.has(Role.OWNER)).toBe(true);
            // Assert - user status should be ACTIVE
            expect(existingUser.status).toBe(UserStatus.ACTIVE);
            // Assert - updateUser should be called
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                existingUser,
            );
            // Assert - request status should be COMPLETED
            expect(validReq.status).toBe(
                OwnerRequestStatus.COMPLETED,
            );
            // Assert - update should be called
            expect(
                ownerRequestServiceMock.update,
            ).toHaveBeenCalledWith(validReq);
        });
    });

    describe('getOwnerRequests()', () => {
        it('should return mapped and paginated OwnerRequests', async () => {
            // Arrange
            const mockPageContent = {
                content: [],
                total: 0,
            } as unknown as PageContent<OwnerRequest>;
            ownerRequestServiceMock.findRequestsPaginated.mockResolvedValue(
                mockPageContent,
            );

            const request = {
                page: 1,
                size: 10,
            } as GetOwnerRequestReq;

            // Act
            const result = await service.getOwnerRequests(request);

            // Assert - findRequestsPaginated should be called with correct params
            expect(
                ownerRequestServiceMock.findRequestsPaginated,
            ).toHaveBeenCalledWith(
                request.page,
                request.size,
                OwnerRequestLoadProfile.WITH_USER,
            );
            // Assert - result should be defined
            expect(result).toBeDefined();
        });
    });
});
