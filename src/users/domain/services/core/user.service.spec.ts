import { Test, TestingModule } from '@nestjs/testing';

describe('UserService', () => {
    let service: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        service = module.get<any>('UserService');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
