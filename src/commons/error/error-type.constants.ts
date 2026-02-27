export const Errors = {
    INTERNAL_ERROR: {
        key: 'INTERNAL_ERROR',
        status: 500,
        message: 'Internal error',
    },
    USER_NOT_ACTIVATED: {
        key: 'USER_NOT_ACTIVATED',
        status: 404,
        message: 'User not activated',
    },
    USER_NOT_FOUND: {
        key: 'USER_NOT_FOUND',
        status: 404,
        message: 'User not found',
    },
    USER_DELETED: {
        key: 'USER_DELETED',
        status: 404,
        message: 'User has been deleted',
    },
    FORBIDDEN: {
        key: 'FORBIDDEN',
        status: 403,
        message: 'Forbidden',
    },
    UNAUTHORIZED: {
        key: 'UNAUTHORIZED',
        status: 401,
        message: 'Unauthorized',
    },
    USER_ALREADY_ACTIVATED: {
        key: 'USER_ALREADY_ACTIVATED',
        status: 404,
        message: 'User already activated',
    },
    INVALID_PASSWORD: {
        key: 'INVALID_PASSWORD',
        status: 400,
        message: 'Invalid password',
    },
    MISSING_REQUIRED_FIELDS: {
        key: 'MISSING_REQUIRED_FIELDS',
        status: 400,
        message: 'Missing required fields',
    },
    INVALID_FIELDS: {
        key: 'INVALID_FIELDS',
        status: 400,
        message: 'Invalid fields',
    },
    EMAIL_ALREADY_EXISTS: {
        key: 'EMAIL_ALREADY_EXISTS',
        status: 400,
        message: 'Email already exists',
    },
} as const;

export type ErrorType = (typeof Errors)[keyof typeof Errors];
