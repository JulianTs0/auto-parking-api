import { Test, TestingModule } from '@nestjs/testing';

describe('UserMobileController', () => {
    let controller: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
        }).compile();

        controller = module.get<any>('UserMobileController');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
