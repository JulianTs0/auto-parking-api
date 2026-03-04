module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'test/e2e',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['../../src/**/*.ts'],
    coverageDirectory: '../coverage/e2e',
    coverageReporters: ['text', 'lcov', 'html'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/../../src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/../setup-e2e.ts'],
    testTimeout: 30000,
};
