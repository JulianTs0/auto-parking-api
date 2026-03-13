import { Test, TestingModule } from '@nestjs/testing';
import { UserMobileService } from './user-mobile.service';

describe('UserMobileService', () => {
    let service: UserMobileService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserMobileService],
        }).compile();

        service = module.get<UserMobileService>(UserMobileService);

        jest.clearAllMocks();
    });

    it('santity check', () => {
        expect(service).toBeDefined();
    });
});
