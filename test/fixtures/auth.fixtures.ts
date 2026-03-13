import { AuthRes } from '../../src/auth/domain/dto/auth/response/auth.response.dto';
import { LoginRes } from '../../src/auth/domain/dto/auth/response/login.response.dto';
import { LoginReq } from '../../src/auth/domain/dto/auth/request/login.request.dto';
import { VerifyEmailReq } from '../../src/auth/domain/dto/auth/request/verify-email.request.dto';
import { RecoverPasswordReq } from '../../src/auth/domain/dto/auth/request/recover-password.request.dto';
import { EditPasswordBody } from '../../src/auth/domain/dto/auth/request/edit-password.body.dto';
import { ResendEmailReq } from '../../src/auth/domain/dto/auth/request/resend-email.request.dto';
import { RegisterReq } from '../../src/auth/domain/dto/auth/request/register.request.dto';
import { Role } from '../../src/commons/const/role.enum';
import { UserStatus } from '../../src/commons/const/user-status.enum';
import { Token } from 'src/commons';

export const createUserFixture = (overrides = {}) => ({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    passwordHash: 'hashedPassword123',
    fullName: 'Test User',
    phoneNumber: '+1234567890',
    roles: new Set([Role.CLIENT]),
    status: UserStatus.ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
});

export const createAdminUserFixture = (overrides = {}) =>
    createUserFixture({
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        fullName: 'Admin User',
        roles: new Set([Role.ADMIN]),
        ...overrides,
    });

export const createOwnerUserFixture = (overrides = {}) =>
    createUserFixture({
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'owner@example.com',
        fullName: 'Owner User',
        roles: new Set([Role.OWNER]),
        ...overrides,
    });

export const createEmployeeUserFixture = (overrides = {}) =>
    createUserFixture({
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'employee@example.com',
        fullName: 'Employee User',
        roles: new Set([Role.EMPLOYEE]),
        ...overrides,
    });

export const createCreateUserDtoFixture = (overrides = {}) => ({
    email: 'newuser@example.com',
    password: 'Password123!',
    fullName: 'New User',
    phoneNumber: '+1234567899',
    ...overrides,
});

export const createLoginDtoFixture = (overrides = {}) => ({
    email: 'test@example.com',
    password: 'Password123!',
    ...overrides,
});

export const createTokenPayloadFixture = (overrides = {}) => ({
    sub: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    roles: new Set([Role.CLIENT]),
    ...overrides,
});

export const createAuthResponseFixture = (overrides = {}) => ({
    accessToken: 'mock-jwt-token',
    user: createUserFixture(),
    ...overrides,
});

export const createAuthResFixture = (overrides = {}) => {
    const userBase = createUserFixture();
    return new AuthRes({
        id: userBase.id,
        fullName: userBase.fullName,
        email: userBase.email,
        phoneNumber: userBase.phoneNumber,
        status: userBase.status,
        roles: Array.from(userBase.roles),
        createdAt: userBase.createdAt,
        updatedAt: userBase.updatedAt,
        ...overrides,
    });
};

// Fixture para LoginRes
export const createLoginResFixture = (overrides = {}) => {
    return new LoginRes({
        token: { accessToken: 'mock-jwt-token' } as Token,
        ...overrides,
    });
};

export const createLoginReqFixture = (overrides = {}) => ({
    email: 'test@example.com',
    password: 'Password123!',
    ...overrides,
});

export const createVerifyEmailReqFixture = (overrides = {}) => {
    return new VerifyEmailReq({
        token: 'mock-verify-token',
        ...overrides,
    });
};

export const createRecoverPasswordReqFixture = (overrides = {}) => {
    return new RecoverPasswordReq({
        email: 'test@example.com',
        ...overrides,
    });
};

export const createEditPasswordBodyFixture = (overrides = {}) => {
    return new EditPasswordBody({
        newPassword: 'NewPassword123!',
        ...overrides,
    });
};

export const createResendEmailReqFixture = (overrides = {}) => {
    return new ResendEmailReq({
        email: 'test@example.com',
        ...overrides,
    });
};

export const createRegisterReqFixture = (overrides = {}) => ({
    email: 'newuser@example.com',
    password: 'Password123!',
    fullName: 'New User',
    phoneNumber: '+1234567899',
    ...overrides,
});
