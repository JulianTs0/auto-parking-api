module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    maxWorkers: 1,
    collectCoverageFrom: ['./src/**/*.ts'],
    coverageDirectory: './coverage/e2e',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ['<rootDir>/test/utils/load-env.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/test/integration/',
        '<rootDir>/src/',
    ],
    testTimeout: 10000,
    forceExit: true,
};
