import { Test, TestingModule } from '@nestjs/testing';

describe('AuthMobileController', () => {
    let controller: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [],
        }).compile();

        controller = module.get<any>('AuthMobileController');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
