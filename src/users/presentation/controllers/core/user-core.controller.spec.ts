import { Test, TestingModule } from '@nestjs/testing';
import { UserCoreController } from './user-core.controller';
import { UserServiceI } from '../../../domain/services/core/user-service.interface';
import { User } from '../../../../commons';
import { createUserFixture } from 'test/fixtures';
import { AuthGuard } from '../../../../auth/config/guards/auth.guard';
import { GetByIdReq } from '../../../domain/dto/users/request/get-by-id.request.dto';
import { GetByIdRes } from '../../../domain/dto/users/response/get-by-id.response.dto';
import { EditBody } from '../../../domain/dto/users/request/edit.body.dto';
import { EditRes } from '../../../domain/dto/users/response/edit.response.dto';
import { DeleteBody } from '../../../domain/dto/users/request/delete.body.dto';
import { toMockEntity } from 'test/utils/entity-mocks.utils';

describe('UserCoreController', () => {
    let controller: UserCoreController;
    let userServiceMock: jest.Mocked<UserServiceI>;

    beforeEach(async () => {
        const mockUserService = {
            getById: jest.fn(),
            edit: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserCoreController],
            providers: [
                {
                    provide: UserServiceI,
                    useValue: mockUserService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<UserCoreController>(
            UserCoreController,
        );
        userServiceMock = module.get(UserServiceI);

        jest.clearAllMocks();
    });

    describe('getById()', () => {
        it('should delegate search to service and return result', async () => {
            // Arrange
            const request = {
                id: 'uuid-123',
            } as GetByIdReq;
            const expectedResponse = {
                id: 'uuid-123',
                email: 'test@test.com',
            } as GetByIdRes;

            userServiceMock.getById.mockResolvedValue(
                expectedResponse,
            );

            // Act
            const result = await controller.getById(request);

            // Assert - getById should be called with request
            expect(userServiceMock.getById).toHaveBeenCalledWith(
                request,
            );
            // Assert - should return expected response
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('edit()', () => {
        it('should map data to EditReq, delegate to service and return', async () => {
            // Arrange
            const targetId = 'uuid-target';
            const body = {
                fullName: 'New Name',
            } as EditBody;

            const authUser = toMockEntity(createUserFixture());

            const expectedResponse = {
                fullName: 'New Name',
            } as EditRes;
            userServiceMock.edit.mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.edit(
                targetId,
                body,
                authUser,
            );

            // Assert - edit should be called with mapped data
            expect(userServiceMock.edit).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: targetId,
                    body: body,
                    authUser: authUser,
                }),
            );
            // Assert - should return expected response
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('delete()', () => {
        it('should map data to DeleteReq and delegate to service', async () => {
            // Arrange
            const targetId = 'uuid-target';
            const body = {
                password: 'my-password-123',
            } as DeleteBody;

            const authUser = toMockEntity(createUserFixture());

            userServiceMock.delete.mockResolvedValue(undefined);

            // Act
            const result = await controller.delete(
                targetId,
                body,
                authUser,
            );

            // Assert - delete should be called with mapped data
            expect(userServiceMock.delete).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: targetId,
                    body: body,
                    authUser: authUser,
                }),
            );
            // Assert - should return undefined
            expect(result).toBeUndefined();
        });
    });
});
