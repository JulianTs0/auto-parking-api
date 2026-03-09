module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': [
            '@swc/jest',
            {
                jsc: {
                    parser: {
                        syntax: 'typescript',
                        decorators: true,
                        dynamicImport: true,
                    },
                    transform: {
                        legacyDecorator: true,
                        decoratorMetadata: true,
                    },
                },
                module: {
                    type: 'commonjs',
                    strictMode: false,
                },
            },
        ],
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
        '!**/*.module.ts',
        '!**/*.interface.ts',
    ],
    coverageDirectory: '../coverage/unit',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1',
        '^test/(.*)$': '<rootDir>/../test/$1',
    },
};
