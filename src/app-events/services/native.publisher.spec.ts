import { Test, TestingModule } from '@nestjs/testing';

describe('NativePublisher', () => {
    let publisher: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        publisher = module.get<any>('NativePublisher');
    });

    it('should be defined', () => {
        expect(publisher).toBeDefined();
    });
});
