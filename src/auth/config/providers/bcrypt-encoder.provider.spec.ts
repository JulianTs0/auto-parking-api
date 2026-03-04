import { Test, TestingModule } from '@nestjs/testing';

describe('BcryptEncoderProvider', () => {
    let provider: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        provider = module.get<any>('BcryptEncoderProvider');
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
