import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

export interface E2ETestContext {
    app: INestApplication;
}

let testContext: E2ETestContext;

export async function setupE2E(): Promise<E2ETestContext> {
    const moduleFixture: TestingModule =
        await Test.createTestingModule({
            imports: [],
        }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    testContext = { app };
    return testContext;
}

export async function teardownE2E(): Promise<void> {
    if (testContext?.app) {
        await testContext.app.close();
    }
}

export function getE2ETestContext(): E2ETestContext {
    return testContext;
}
