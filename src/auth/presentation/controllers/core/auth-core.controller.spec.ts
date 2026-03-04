import { Test, TestingModule } from '@nestjs/testing';

describe('AuthCoreController', () => {
    let controller: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
        }).compile();

        controller = module.get<any>('AuthCoreController');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
