import { Test, TestingModule } from '@nestjs/testing';

describe('UserWebService', () => {
    let service: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        service = module.get<any>('UserWebService');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
