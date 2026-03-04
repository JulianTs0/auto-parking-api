import { Test, TestingModule } from '@nestjs/testing';

describe('AuthWebController', () => {
    let controller: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
        }).compile();

        controller = module.get<any>('AuthWebController');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
