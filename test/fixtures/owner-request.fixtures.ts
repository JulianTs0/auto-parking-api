import { OwnerRequestStatus } from '../../src/commons/const/owner-request-status.enum';
import { Role } from '../../src/commons/const/role.enum';
import { UserStatus } from '../../src/commons/const/user-status.enum';
import { User } from '../../src/commons/entity/user.entity';
import { OwnerRequest } from '../../src/commons/entity/owner-request.entity';
import { GetOwnerRequestReq } from '../../src/auth/domain/dto/auth/request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../src/auth/domain/dto/auth/response/get-owner-request.response.dto';
import { OwnerRequestItemRes } from '../../src/auth/domain/dto/auth/response/get-owner-request.response.dto';
import { OwnerRequestUserData } from '../../src/auth/domain/dto/auth/response/get-owner-request.response.dto';

const baseUser = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'owner@example.com',
    fullName: 'Test Owner',
    passwordHash: 'hashedPassword123',
    phoneNumber: '+1234567890',
    roles: new Set([Role.CLIENT]),
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    subscriptions: [],
    vehicles: [],
    paymentMethods: [],
    parkingLots: [],
};

export const createOwnerRequestFixture = (overrides = {}) => ({
    id: '550e8400-e29b-41d4-a716-446655440000',
    user: { ...baseUser } as unknown as User,
    status: OwnerRequestStatus.PENDING,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
});

export const createApprovedOwnerRequestFixture = (overrides = {}) =>
    createOwnerRequestFixture({
        id: '550e8400-e29b-41d4-a716-446655440002',
        status: OwnerRequestStatus.APPROVED,
        ...overrides,
    });

export const createRejectedOwnerRequestFixture = (overrides = {}) =>
    createOwnerRequestFixture({
        id: '550e8400-e29b-41d4-a716-446655440003',
        status: OwnerRequestStatus.REJECTED,
        ...overrides,
    });

export const createOwnerRequestsListFixture = () => [
    createOwnerRequestFixture(),
    createApprovedOwnerRequestFixture(),
    createRejectedOwnerRequestFixture(),
];

export const createPaginatedOwnerRequestsFixture = (
    overrides = {},
) => ({
    content: createOwnerRequestsListFixture(),
    page: 1,
    nextPage: null,
    ...overrides,
});

export const createOwnerRequestEntityFixture = (overrides = {}) =>
    new OwnerRequest(createOwnerRequestFixture(overrides));

export const createOwnerRequestUserDataFixture = (overrides = {}) =>
    new OwnerRequestUserData({
        fullName: 'Test Owner',
        email: 'owner@example.com',
        phoneNumber: '+1234567890',
        ...overrides,
    });

export const createOwnerRequestItemResFixture = (overrides = {}) =>
    new OwnerRequestItemRes({
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: OwnerRequestStatus.PENDING,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: createOwnerRequestUserDataFixture(),
        ...overrides,
    });

export const createGetOwnerRequestResFixture = (overrides = {}) =>
    new GetOwnerRequestRes({
        requests: [createOwnerRequestItemResFixture()],
        nextPage: null,
        ...overrides,
    });

export const createGetOwnerRequestReqFixture = (overrides = {}) =>
    new GetOwnerRequestReq({
        authUser: new User({
            id: '550e8400-e29b-41d4-a716-446655440001',
            email: 'admin@example.com',
            fullName: 'Admin User',
            passwordHash: 'hashedPassword123',
            roles: new Set([Role.ADMIN]),
            status: UserStatus.ACTIVE,
        }),
        page: 1,
        size: 10,
        ...overrides,
    });
