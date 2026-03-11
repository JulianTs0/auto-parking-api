import { User } from '../../src/commons/entity/user.entity';
import { Role } from '../../src/commons/const/role.enum';
import { UserStatus } from '../../src/commons/const/user-status.enum';

export const toMockEntity = (
    fixtureData: any,
    overrides = {},
): User => {
    const roles = fixtureData.roles || new Set();

    const mockEntity = {
        ...fixtureData,
        isAdmin: jest.fn().mockReturnValue(roles.has(Role.ADMIN)),
        isDeleted: jest
            .fn()
            .mockReturnValue(
                fixtureData.status === UserStatus.DELETED,
            ),
        isInactive: jest
            .fn()
            .mockReturnValue(
                fixtureData.status === UserStatus.INACTIVE,
            ),
        isActive: jest
            .fn()
            .mockReturnValue(
                fixtureData.status === UserStatus.ACTIVE,
            ),
    };

    Object.keys(overrides).forEach((key) => {
        if (typeof overrides[key] === 'function') {
            mockEntity[key] = overrides[key];
        } else {
            mockEntity[key] = overrides[key];
        }
    });

    return mockEntity as unknown as User;
};

export const toMockEntityWithMethods = (
    fixtureData: any,
    methodOverrides = {},
): User => {
    return {
        ...fixtureData,
        isDeleted: jest.fn().mockReturnValue(false),
        isInactive: jest.fn().mockReturnValue(false),
        isActive: jest.fn().mockReturnValue(true),
        ...methodOverrides,
    } as unknown as User;
};
