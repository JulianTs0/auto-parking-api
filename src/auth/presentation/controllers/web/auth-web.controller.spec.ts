import { Test, TestingModule } from '@nestjs/testing';
import { AuthWebController } from './auth-web.controller';
import { AuthWebServiceI } from '../../../domain/services/web/auth-web-service.interface';
import { AuthGuard } from '../../../config/guards/auth.guard';
import { User } from 'src/commons';
import { RegisterReq } from '../../../domain/dto/auth/request/register.request.dto';
import { RegisterEmployeeBody } from '../../../domain/dto/auth/request/register-employee-body.dto';
import { GetOwnerRequestQuery } from '../../../domain/dto/auth/request/get-owner-request.query';
import { GetOwnerRequestRes } from '../../../domain/dto/auth/response/get-owner-request.response.dto';
import { AcceptOwnerRequestBody } from '../../../domain/dto/auth/request/accept-owner-request.body.dto';
import { RequestOwnerUpgradeBody } from '../../../domain/dto/auth/request/request-owner-upgrade-body.dto';
import { UpgradeToOwnerBody } from '../../../domain/dto/auth/request/upgrade-to-owner.body.dto';
import { RolesGuard } from 'src/auth/config/guards/roles.guard';
import {
    createAdminUserFixture,
    createCreateUserDtoFixture,
    createOwnerUserFixture,
    createUserFixture,
} from 'test/fixtures';

describe('AuthWebController', () => {
    let controller: AuthWebController;
    let authWebServiceMock: jest.Mocked<AuthWebServiceI>;

    const toMockEntity = (
        fixtureData: any,
        methodOverrides = {},
    ): User =>
        ({
            ...fixtureData,
            isDeleted: jest.fn().mockReturnValue(false),
            isInactive: jest.fn().mockReturnValue(false),
            isActive: jest.fn().mockReturnValue(true),
            ...methodOverrides,
        }) as unknown as User;

    beforeEach(async () => {
        const mockAuthWebService = {
            register: jest.fn(),
            registerEmployee: jest.fn(),
            getOwnerRequests: jest.fn(),
            acceptOwnerRequest: jest.fn(),
            requestOwnerUpgrade: jest.fn(),
            upgrade: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthWebController],
            providers: [
                {
                    provide: AuthWebServiceI,
                    useValue: mockAuthWebService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthWebController>(AuthWebController);
        authWebServiceMock = module.get(AuthWebServiceI);

        jest.clearAllMocks();
    });

    describe('register()', () => {
        it('debería delegar al servicio y no retornar nada', async () => {
            // Arrange
            const request =
                createCreateUserDtoFixture() as RegisterReq;
            authWebServiceMock.register.mockResolvedValue(undefined);

            // Act
            const result = await controller.register(request);

            // Assert
            expect(authWebServiceMock.register).toHaveBeenCalledWith(
                request,
            );
            expect(result).toBeUndefined();
        });
    });

    describe('registerEmployee()', () => {
        it('debería mapear los datos, delegar al servicio y no retornar nada', async () => {
            // Arrange
            const body = {
                email: 'empleado@test.com',
            } as RegisterEmployeeBody;
            const authUser = toMockEntity(createOwnerUserFixture());

            authWebServiceMock.registerEmployee.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.registerEmployee(
                body,
                authUser,
            );

            // Assert
            expect(
                authWebServiceMock.registerEmployee,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toBeUndefined();
        });
    });

    describe('getOwnerRequests()', () => {
        it('debería mapear la query, delegar al servicio y retornar GetOwnerRequestRes', async () => {
            // Arrange
            const query = {
                page: 1,
                size: 10,
            } as GetOwnerRequestQuery;
            const authUser = toMockEntity(createAdminUserFixture());

            const expectedResponse = new GetOwnerRequestRes({
                requests: [],
                nextPage: null,
            });

            authWebServiceMock.getOwnerRequests.mockResolvedValue(
                expectedResponse,
            );

            // Act
            const result = await controller.getOwnerRequests(
                query,
                authUser,
            );

            // Assert
            expect(
                authWebServiceMock.getOwnerRequests,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    size: 10,
                    authUser: authUser,
                }),
            );
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('acceptOwnerRequest()', () => {
        it('debería mapear los datos, delegar al servicio y no retornar nada', async () => {
            // Arrange
            const body = {
                ownerEmail: 'owner@test.com',
            } as AcceptOwnerRequestBody;
            const authUser = toMockEntity(createAdminUserFixture());

            authWebServiceMock.acceptOwnerRequest.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.acceptOwnerRequest(
                body,
                authUser,
            );

            // Assert
            expect(
                authWebServiceMock.acceptOwnerRequest,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toBeUndefined();
        });
    });

    describe('requestOwnerUpgrade()', () => {
        it('debería mapear los datos, delegar al servicio y no retornar nada', async () => {
            // Arrange
            const body = {
                email: 'test@test.com',
            } as RequestOwnerUpgradeBody;
            const authUser = toMockEntity(createUserFixture());

            authWebServiceMock.requestOwnerUpgrade.mockResolvedValue(
                undefined,
            );

            // Act
            const result = await controller.requestOwnerUpgrade(
                body,
                authUser,
            );

            // Assert
            expect(
                authWebServiceMock.requestOwnerUpgrade,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toBeUndefined();
        });
    });

    describe('upgrade()', () => {
        it('debería mapear los datos, delegar al servicio y no retornar nada', async () => {
            // Arrange
            const body = {
                email: 'test@test.com',
            } as UpgradeToOwnerBody;
            const authUser = toMockEntity(createUserFixture());

            authWebServiceMock.upgrade.mockResolvedValue(undefined);

            // Act
            const result = await controller.upgrade(body, authUser);

            // Assert
            expect(authWebServiceMock.upgrade).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toBeUndefined();
        });
    });
});
