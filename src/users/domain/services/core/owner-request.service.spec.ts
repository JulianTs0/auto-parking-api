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
        it('should delegate to repository and return saved request', async () => {
            // Arrange
            const mockOwnerRequest = createOwnerRequestFixture();
            repositoryMock.save.mockResolvedValue(mockOwnerRequest);

            // Act
            const result = await service.save(mockOwnerRequest);

            // Assert - save should be called with request
            expect(repositoryMock.save).toHaveBeenCalledWith(
                mockOwnerRequest,
            );
            // Assert - should return saved request
            expect(result).toEqual(mockOwnerRequest);
        });
    });

    describe('update()', () => {
        it('should delegate to repository and return updated request', async () => {
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

            // Assert - update should be called with request
            expect(repositoryMock.update).toHaveBeenCalledWith(
                mockApprovedOwnerRequest,
            );
            // Assert - should return updated request
            expect(result).toEqual(mockApprovedOwnerRequest);
        });
    });

    describe('findByUserId()', () => {
        it('should delegate to repository sending userId and profile', async () => {
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

            // Assert - findByUserId should be called with userId and profile
            expect(repositoryMock.findByUserId).toHaveBeenCalledWith(
                userId,
                profileMock,
            );
            // Assert - should return request
            expect(result).toEqual(mockOwnerRequest);
        });
    });

    describe('findPendingByUserId()', () => {
        it('should search pending requests delegating to repository', async () => {
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

            // Assert - findPendingByUserId should be called
            expect(
                repositoryMock.findPendingByUserId,
            ).toHaveBeenCalledWith(userId, profileMock);
            // Assert - should return request
            expect(result).toEqual(mockOwnerRequest);
        });
    });

    describe('findRequestsPaginated()', () => {
        it('should return paginated list from repository', async () => {
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

            // Assert - findRequestsPaginated should be called with params
            expect(
                repositoryMock.findRequestsPaginated,
            ).toHaveBeenCalledWith(page, size, profileMock);
            // Assert - should return paginated result
            expect(result).toEqual(mockPaginatedOwnerRequests);
        });
    });
});
