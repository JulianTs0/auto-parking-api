import { Test, TestingModule } from '@nestjs/testing';

describe('UserCoreController', () => {
    let controller: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
        }).compile();

        controller = module.get<any>('UserCoreController');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
