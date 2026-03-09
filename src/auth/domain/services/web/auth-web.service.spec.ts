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

    beforeEach(async () => {
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

        jest.clearAllMocks();
    });

    describe('register()', () => {
        it('debería lanzar CLIENT_ALREADY_EXISTS si ya tiene rol CLIENT pero no OWNER', async () => {
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

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.CLIENT_ALREADY_EXISTS),
            );
        });

        it('debería lanzar EMAIL_ALREADY_EXISTS si ya existe y tiene rol OWNER', async () => {
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

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.EMAIL_ALREADY_EXISTS),
            );
        });

        it('debería registrar al usuario, asignarle rol CLIENT, INACTIVE y crear el OwnerRequest (Camino Feliz)', async () => {
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

            // Assert
            expect(builtUser.roles.has(Role.CLIENT)).toBe(true);
            expect(builtUser.status).toBe(UserStatus.INACTIVE);
            expect(userServiceMock.saveUser).toHaveBeenCalledWith(
                builtUser,
            );

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
        it('debería lanzar USER_NOT_FOUND si el dueño no existe por email', async () => {
            // Arrange
            const reqEmail = createOwnerUserFixture().email;
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            const request = {
                body: { ownerEmail: reqEmail },
            } as unknown as AcceptOwnerRequestReq;

            // Act
            const result = service.acceptOwnerRequest(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('debería aprobar la request, generar token y emitir evento (Camino Feliz)', async () => {
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

            // Assert
            expect(mockOwnerReq.status).toBe(
                OwnerRequestStatus.APPROVED,
            );
            expect(
                ownerRequestServiceMock.update,
            ).toHaveBeenCalledWith(mockOwnerReq);
            expect(authHelperMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
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
        it('debería actualizar roles y salir sin emitir evento si el usuario ya existe', async () => {
            // Arrange
            // Fixture de cliente común
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

            // Assert
            expect(existingUser.roles.has(Role.EMPLOYEE)).toBe(true); // Se le agregó el rol
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                existingUser,
            );
            expect(userServiceMock.saveUser).not.toHaveBeenCalled();
            expect(eventPublisherMock.emit).not.toHaveBeenCalled();
        });

        it('debería construir usuario, asignar CLIENT+EMPLOYEE, guardar y emitir evento si es nuevo (Camino Feliz)', async () => {
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

            // Assert
            expect(builtUser.roles.has(Role.CLIENT)).toBe(true);
            expect(builtUser.roles.has(Role.EMPLOYEE)).toBe(true);
            expect(userServiceMock.saveUser).toHaveBeenCalledWith(
                builtUser,
            );

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
        it('debería lanzar USER_NOT_FOUND si el usuario no existe', async () => {
            // Arrange
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            const request = {
                body: { email: 'no-existe@test.com' },
            } as unknown as RequestOwnerUpgradeReq;

            // Act
            const result = service.requestOwnerUpgrade(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });

        it('debería lanzar EMAIL_ALREADY_EXISTS si ya tiene rol OWNER', async () => {
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

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.EMAIL_ALREADY_EXISTS),
            );
        });

        it('debería lanzar OWNER_REQUEST_ALREADY_EXISTS si ya tiene un request pendiente', async () => {
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

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.OWNER_REQUEST_ALREADY_EXISTS),
            );
        });

        it('debería generar y guardar un nuevo OwnerRequest en PENDING (Camino feliz)', async () => {
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

            // Assert
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
        it('debería lanzar USER_NOT_FOUND si el usuario no existe', async () => {
            // Arrange
            userServiceMock.findUserByEmail.mockResolvedValue(null);
            const request = {
                body: {
                    email: 'no-existe@test.com',
                },
            } as unknown as UpgradeToOwnerReq;

            // Act
            const result = service.upgrade(request);

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.USER_NOT_FOUND),
            );
        });
        it('debería lanzar OWNER_REQUEST_NOT_FOUND si no hay request o no está APPROVED', async () => {
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

            // Assert
            await expect(result).rejects.toThrow(
                new ServiceError(Errors.OWNER_REQUEST_NOT_FOUND),
            );
        });

        it('debería agregar rol OWNER, activar usuario y marcar request como COMPLETED (Camino feliz)', async () => {
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

            // Assert
            expect(existingUser.roles.has(Role.OWNER)).toBe(true);
            expect(existingUser.status).toBe(UserStatus.ACTIVE);
            expect(userServiceMock.updateUser).toHaveBeenCalledWith(
                existingUser,
            );

            expect(validReq.status).toBe(
                OwnerRequestStatus.COMPLETED,
            );
            expect(
                ownerRequestServiceMock.update,
            ).toHaveBeenCalledWith(validReq);
        });
    });

    describe('getOwnerRequests()', () => {
        it('debería retornar los OwnerRequests mapeados y paginados', async () => {
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

            // Assert
            expect(
                ownerRequestServiceMock.findRequestsPaginated,
            ).toHaveBeenCalledWith(
                request.page,
                request.size,
                OwnerRequestLoadProfile.WITH_USER,
            );
            expect(result).toBeDefined();
        });
    });
});
