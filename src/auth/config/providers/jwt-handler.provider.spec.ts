import { Test, TestingModule } from '@nestjs/testing';

describe('JwtHandlerProvider', () => {
    let provider: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        provider = module.get<any>('JwtHandlerProvider');
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
