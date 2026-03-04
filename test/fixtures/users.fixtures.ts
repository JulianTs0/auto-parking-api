import { Role } from '../../src/commons/const/role.enum';
import { UserStatus } from '../../src/commons/const/user-status.enum';

export const createUserListFixture = (overrides = {}) => [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user1@example.com',
        fullName: 'User One',
        phoneNumber: '+1234567890',
        roles: new Set([Role.CLIENT]),
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'user2@example.com',
        fullName: 'User Two',
        phoneNumber: '+1234567891',
        roles: new Set([Role.CLIENT]),
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'user3@example.com',
        fullName: 'User Three',
        phoneNumber: '+1234567892',
        roles: new Set([Role.CLIENT]),
        status: UserStatus.ACTIVE,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
    },
];

export const createUpdateUserDtoFixture = (overrides = {}) => ({
    fullName: 'Updated Name',
    phoneNumber: '+9999999999',
    ...overrides,
});

export const createPaginatedUsersFixture = (overrides = {}) => ({
    content: createUserListFixture(),
    total: 3,
    page: 1,
    limit: 10,
    totalPages: 1,
    ...overrides,
});
