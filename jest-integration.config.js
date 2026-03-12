module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    maxWorkers: 1,
    collectCoverageFrom: [
        './src/**/*.ts',
        '!**/*.module.ts',
        '!**/*.interface.ts',
    ],
    coverageDirectory: './coverage/integration',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ['<rootDir>/test/utils/load-env.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/setup-integration.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/test/e2e/',
        '<rootDir>/src/.*\\.spec\\.ts$',
    ],
};
