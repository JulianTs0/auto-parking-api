import { Test, TestingModule } from '@nestjs/testing';

describe('GlobalExceptionFilter', () => {
    let filter: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        filter = module.get<any>('GlobalExceptionFilter');
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });
});
