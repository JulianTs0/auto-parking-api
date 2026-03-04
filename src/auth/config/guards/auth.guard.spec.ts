import { Test, TestingModule } from '@nestjs/testing';

describe('AuthGuard', () => {
    let guard: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        guard = module.get<any>('AuthGuard');
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
});
