import { OwnerRequestStatus } from '../../src/commons/const/owner-request-status.enum';
import { Role } from '../../src/commons/const/role.enum';
import { UserStatus } from '../../src/commons/const/user-status.enum';

export const mockOwnerRequest = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    user: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'owner@example.com',
        password: 'hashedPassword123',
        name: 'Test',
        lastName: 'Owner',
        phone: '+1234567890',
        role: Role.CLIENT,
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    status: OwnerRequestStatus.PENDING,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

export const mockApprovedOwnerRequest = {
    ...mockOwnerRequest,
    id: '550e8400-e29b-41d4-a716-446655440002',
    status: OwnerRequestStatus.APPROVED,
};

export const mockRejectedOwnerRequest = {
    ...mockOwnerRequest,
    id: '550e8400-e29b-41d4-a716-446655440003',
    status: OwnerRequestStatus.REJECTED,
};

export const mockOwnerRequestsList = [
    mockOwnerRequest,
    mockApprovedOwnerRequest,
    mockRejectedOwnerRequest,
];

export const mockPaginatedOwnerRequests = {
    content: mockOwnerRequestsList,
    page: 1,
    nextPage: null,
};
