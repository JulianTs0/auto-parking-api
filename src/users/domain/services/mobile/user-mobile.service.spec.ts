import { Test, TestingModule } from '@nestjs/testing';

describe('UserMobileService', () => {
    let service: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        service = module.get<any>('UserMobileService');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
