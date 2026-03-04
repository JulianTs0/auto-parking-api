import { Test, TestingModule } from '@nestjs/testing';

describe('AuthHelper', () => {
    let helper: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        helper = module.get<any>('AuthHelper');
    });

    it('should be defined', () => {
        expect(helper).toBeDefined();
    });
});
