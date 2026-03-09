import { Test, TestingModule } from '@nestjs/testing';
import { OwnerRequestService } from './owner-request.service';
import { OwnerRequestRepositoryI } from '../../repository/owner-request-repository.interface';
import {
    createApprovedOwnerRequestFixture,
    createOwnerRequestFixture,
    createPaginatedOwnerRequestsFixture,
} from 'test/fixtures';
import { OwnerRequestLoadProfile } from 'src/users/persistance/datasource/data/postgres/profiles/owner-request-load.profile';

describe('OwnerRequestService', () => {
    let service: OwnerRequestService;
    let repositoryMock: jest.Mocked<OwnerRequestRepositoryI>;

    beforeEach(async () => {
        const mockRepository = {
            save: jest.fn(),
            update: jest.fn(),
            findByUserId: jest.fn(),
            findPendingByUserId: jest.fn(),
            findRequestsPaginated: jest.fn(),
        } as unknown as jest.Mocked<OwnerRequestRepositoryI>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OwnerRequestService,
                {
                    provide: OwnerRequestRepositoryI,
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<OwnerRequestService>(
            OwnerRequestService,
        );
        repositoryMock = module.get(OwnerRequestRepositoryI);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(service).toBeDefined();
    });

    describe('save()', () => {
        it('debería delegar al repositorio y retornar la request guardada', async () => {
            // Arrange
            const mockOwnerRequest = createOwnerRequestFixture();
            repositoryMock.save.mockResolvedValue(mockOwnerRequest);

            // Act
            const result = await service.save(mockOwnerRequest);

            // Assert
            expect(repositoryMock.save).toHaveBeenCalledWith(
                mockOwnerRequest,
            );
            expect(result).toEqual(mockOwnerRequest);
        });
    });

    describe('update()', () => {
        it('debería delegar al repositorio y retornar la request actualizada', async () => {
            // Arrange
            const mockApprovedOwnerRequest =
                createApprovedOwnerRequestFixture();
            repositoryMock.update.mockResolvedValue(
                mockApprovedOwnerRequest,
            );

            // Act
            const result = await service.update(
                mockApprovedOwnerRequest,
            );

            // Assert
            expect(repositoryMock.update).toHaveBeenCalledWith(
                mockApprovedOwnerRequest,
            );
            expect(result).toEqual(mockApprovedOwnerRequest);
        });
    });

    describe('findByUserId()', () => {
        it('debería delegar al repositorio enviando el userId y el profile', async () => {
            // Arrange
            const userId = '550e8400-e29b-41d4-a716-446655440001';
            const profileMock = OwnerRequestLoadProfile.WITH_USER;
            const mockOwnerRequest = createOwnerRequestFixture();

            repositoryMock.findByUserId.mockResolvedValue(
                mockOwnerRequest,
            );

            // Act
            const result = await service.findByUserId(
                userId,
                profileMock,
            );

            // Assert
            expect(repositoryMock.findByUserId).toHaveBeenCalledWith(
                userId,
                profileMock,
            );
            expect(result).toEqual(mockOwnerRequest);
        });
    });

    describe('findPendingByUserId()', () => {
        it('debería buscar requests pendientes delegando al repositorio', async () => {
            // Arrange
            const userId = '550e8400-e29b-41d4-a716-446655440001';
            const profileMock = OwnerRequestLoadProfile.WITH_USER;
            const mockOwnerRequest = createOwnerRequestFixture();

            repositoryMock.findPendingByUserId.mockResolvedValue(
                mockOwnerRequest,
            );

            // Act
            const result = await service.findPendingByUserId(
                userId,
                profileMock,
            );

            // Assert
            expect(
                repositoryMock.findPendingByUserId,
            ).toHaveBeenCalledWith(userId, profileMock);
            expect(result).toEqual(mockOwnerRequest);
        });
    });

    describe('findRequestsPaginated()', () => {
        it('debería retornar la lista paginada desde el repositorio', async () => {
            // Arrange
            const page = 1;
            const size = 10;
            const profileMock = OwnerRequestLoadProfile.WITH_USER;
            const mockPaginatedOwnerRequests =
                createPaginatedOwnerRequestsFixture();

            repositoryMock.findRequestsPaginated.mockResolvedValue(
                mockPaginatedOwnerRequests,
            );

            // Act
            const result = await service.findRequestsPaginated(
                page,
                size,
                profileMock,
            );

            // Assert
            expect(
                repositoryMock.findRequestsPaginated,
            ).toHaveBeenCalledWith(page, size, profileMock);
            expect(result).toEqual(mockPaginatedOwnerRequests);
        });
    });
});
