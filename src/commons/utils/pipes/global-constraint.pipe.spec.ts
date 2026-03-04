import { Test, TestingModule } from '@nestjs/testing';

describe('GlobalConstraintPipe', () => {
    let pipe: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        pipe = module.get<any>('GlobalConstraintPipe');
    });

    it('should be defined', () => {
        expect(pipe).toBeDefined();
    });
});
