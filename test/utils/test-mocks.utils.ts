export const createMockAuthHelper = () => ({
    parseToken: jest.fn(),
    getSubject: jest.fn(),
    validatePassword: jest.fn(),
    createToken: jest.fn(),
    hashPassword: jest.fn(),
});

export const createMockEventPublisher = () => ({
    emit: jest.fn(),
});

export const createMockUserService = () => ({
    findUserById: jest.fn(),
    findUserByEmail: jest.fn(),
    existsUserByEmail: jest.fn(),
    saveUser: jest.fn(),
    updateUser: jest.fn(),
});

export const createMockUserRepository = () => ({
    findById: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
});

export const createMockAuthWebService = () => ({
    register: jest.fn(),
    registerEmployee: jest.fn(),
    getOwnerRequests: jest.fn(),
    acceptOwnerRequest: jest.fn(),
    requestOwnerUpgrade: jest.fn(),
    upgrade: jest.fn(),
});

export const createMockAuthMobileService = () => ({
    register: jest.fn(),
    login: jest.fn(),
});

export const createMockUserWebService = () => ({
    getAll: jest.fn(),
    getById: jest.fn(),
    edit: jest.fn(),
    delete: jest.fn(),
    getVehicles: jest.fn(),
    addVehicle: jest.fn(),
    removeVehicle: jest.fn(),
    getPaymentMethods: jest.fn(),
    addPaymentMethod: jest.fn(),
    removePaymentMethod: jest.fn(),
    getSubscriptions: jest.fn(),
    getOwnerRequests: jest.fn(),
});

export const createMockUserMobileService = () => ({
    getProfile: jest.fn(),
    editProfile: jest.fn(),
    getVehicles: jest.fn(),
    addVehicle: jest.fn(),
    removeVehicle: jest.fn(),
});

export const createMockOwnerRequestRepository = () => ({
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findPendingByUserId: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findPending: jest.fn(),
});

export const createMockJwtHandler = () => ({
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
});

export const createMockBcryptEncoder = () => ({
    encode: jest.fn(),
    compare: jest.fn(),
});

export const createMockEmailService = () => ({
    sendVerifyEmail: jest.fn(),
    sendRecoverEmail: jest.fn(),
    sendEmployeeRegistrationEmail: jest.fn(),
    send: jest.fn(),
});

export const createMockEventPublisherWithKeys = (keys: string[]) => {
    const mocks: Record<string, jest.Mock> = {};
    keys.forEach((key) => {
        mocks[key] = jest.fn();
    });
    return {
        emit: jest.fn((key: string, data: any) => {
            if (mocks[key]) {
                mocks[key](data);
            }
        }),
        ...mocks,
    };
};
