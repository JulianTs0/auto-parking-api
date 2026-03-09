import { Test, TestingModule } from '@nestjs/testing';
import { UserWebService } from './user-web.service';

describe('UserWebService', () => {
    let service: UserWebService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserWebService],
        }).compile();

        service = module.get<UserWebService>(UserWebService);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(service).toBeDefined();
    });
});
