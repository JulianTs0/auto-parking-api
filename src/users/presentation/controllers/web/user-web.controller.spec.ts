import { Test, TestingModule } from '@nestjs/testing';

describe('UserWebController', () => {
    let controller: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
        }).compile();

        controller = module.get<any>('UserWebController');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
