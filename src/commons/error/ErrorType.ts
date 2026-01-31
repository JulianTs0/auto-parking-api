export const Errors = {
    INTERNAL_ERROR: {
        key: 'INTERNAL_ERROR',
        status: 500,
        message: 'Internal error',
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
} as const;

export type ErrorType = (typeof Errors)[keyof typeof Errors];
