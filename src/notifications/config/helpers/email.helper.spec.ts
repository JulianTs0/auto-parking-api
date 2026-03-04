import { Test, TestingModule } from '@nestjs/testing';

describe('EmailHelper', () => {
    let helper: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        helper = module.get<any>('EmailHelper');
    });

    it('should be defined', () => {
        expect(helper).toBeDefined();
    });
});
