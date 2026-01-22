export const Errors = {
    INTERNAL_ERROR: {
        key: 'INTERNAL_ERROR',
        status: 500,
        message: 'Internal error',
    },
} as const;

export type ErrorType = (typeof Errors)[keyof typeof Errors];
