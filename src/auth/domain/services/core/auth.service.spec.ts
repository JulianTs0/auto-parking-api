import { Test, TestingModule } from '@nestjs/testing';

describe('AuthService', () => {
    let service: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [],
        }).compile();

        service = module.get<any>('AuthService');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
