import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

export interface TestModule {
    module: TestingModule;
    app: INestApplication;
}

export async function createTestingModule(
    moduleFixtures: any[],
): Promise<TestModule> {
    const module: TestingModule = await Test.createTestingModule({
        imports: moduleFixtures,
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    return { module, app };
}

export async function closeTestingModule(
    testModule: TestModule,
): Promise<void> {
    await testModule.app.close();
    await testModule.module.close();
}
