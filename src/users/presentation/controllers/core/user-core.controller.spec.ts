import { Test, TestingModule } from '@nestjs/testing';
import { UserCoreController } from './user-core.controller';
import { UserServiceI } from '../../../domain/services/core/user-service.interface';
import { User } from '../../../../commons';
import { createUserFixture } from 'test/fixtures';
import { AuthGuard } from '../../../../auth/config/guards/auth.guard';

describe('UserCoreController', () => {
    let controller: UserCoreController;
    let userServiceMock: jest.Mocked<UserServiceI>;

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
        it('debería delegar la búsqueda al servicio y retornar el resultado', async () => {
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

            // Assert
            expect(userServiceMock.getById).toHaveBeenCalledWith(
                request,
            );
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('edit()', () => {
        it('debería mapear los datos a un EditReq, delegar al servicio y retornar', async () => {
            // Arrange
            const targetId = 'uuid-target';
            const body = {
                fullName: 'Nuevo Nombre',
            } as EditBody;

            const authUser = toMockEntity(createUserFixture());

            const expectedResponse = {
                fullName: 'Nuevo Nombre',
            } as EditRes;
            userServiceMock.edit.mockResolvedValue(expectedResponse);

            // Act
            const result = await controller.edit(
                targetId,
                body,
                authUser,
            );

            // Assert
            expect(userServiceMock.edit).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: targetId,
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('delete()', () => {
        it('debería mapear los datos a un DeleteReq y delegar al servicio', async () => {
            // Arrange
            const targetId = 'uuid-target';
            const body = {
                password: 'mi-password-123',
            } as DeleteBody;

            const authUser = toMockEntity(createUserFixture());

            userServiceMock.delete.mockResolvedValue(undefined);

            // Act
            const result = await controller.delete(
                targetId,
                body,
                authUser,
            );

            // Assert
            expect(userServiceMock.delete).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: targetId,
                    body: body,
                    authUser: authUser,
                }),
            );
            expect(result).toBeUndefined();
        });
    });
});
