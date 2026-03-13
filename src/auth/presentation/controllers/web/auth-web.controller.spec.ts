import { Test, TestingModule } from '@nestjs/testing';
import { AuthWebController } from './auth-web.controller';
import { AuthWebServiceI } from '../../../domain/services/web/auth-web-service.interface';
import { AuthGuard } from '../../../config/guards/auth.guard';
import { SoftAuthGuard } from '../../../config/guards/soft-auth.guard';
import { AuthHelper } from '../../../config/helpers/auth.helper';
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
import { toMockEntity } from 'test/utils/entity-mocks.utils';

describe('AuthWebController', () => {
    let controller: AuthWebController;
    let authWebServiceMock: jest.Mocked<AuthWebServiceI>;

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
                {
                    provide: AuthHelper,
                    useValue: {
                        parseToken: jest.fn(),
                        getSubject: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(SoftAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthWebController>(AuthWebController);
        authWebServiceMock = module.get(AuthWebServiceI);

        jest.clearAllMocks();
    });

    describe('register()', () => {
        it('should delegate to service and return undefined', async () => {
            // Arrange
            const request =
                createCreateUserDtoFixture() as RegisterReq;
            authWebServiceMock.register.mockResolvedValue(undefined);

            // Act
            const result = await controller.register(request);

            // Assert - register should be called with request
            expect(authWebServiceMock.register).toHaveBeenCalledWith(
                request,
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('registerEmployee()', () => {
        it('should map data, delegate to service and return undefined', async () => {
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

            // Assert - registerEmployee should be called with mapped data
            expect(
                authWebServiceMock.registerEmployee,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('getOwnerRequests()', () => {
        it('should map query, delegate to service and return GetOwnerRequestRes', async () => {
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

            // Assert - getOwnerRequests should be called with mapped data
            expect(
                authWebServiceMock.getOwnerRequests,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    size: 10,
                    authUser: authUser,
                }),
            );
            // Assert - should return expected response
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('acceptOwnerRequest()', () => {
        it('should map data, delegate to service and return undefined', async () => {
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

            // Assert - acceptOwnerRequest should be called with mapped data
            expect(
                authWebServiceMock.acceptOwnerRequest,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('requestOwnerUpgrade()', () => {
        it('should map data, delegate to service and return undefined', async () => {
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

            // Assert - requestOwnerUpgrade should be called with mapped data
            expect(
                authWebServiceMock.requestOwnerUpgrade,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: authUser,
                }),
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });

    describe('upgrade()', () => {
        it('should map data, delegate to service and return undefined', async () => {
            // Arrange
            const body = {
                email: 'test@test.com',
            } as UpgradeToOwnerBody;
            const authUser = toMockEntity(createUserFixture());

            authWebServiceMock.upgrade.mockResolvedValue(undefined);

            // Act
            const result = await controller.upgrade(body);

            // Assert - upgrade should be called with mapped data
            expect(authWebServiceMock.upgrade).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: body,
                    authUser: null,
                }),
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });
});
