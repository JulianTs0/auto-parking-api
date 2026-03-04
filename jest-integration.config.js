module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'test/integration',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '../../src/**/*.ts',
        '!**/*.module.ts',
        '!**/*.interface.ts',
    ],
    coverageDirectory: '../coverage/integration',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/../../src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/../setup-integration.ts'],
};
