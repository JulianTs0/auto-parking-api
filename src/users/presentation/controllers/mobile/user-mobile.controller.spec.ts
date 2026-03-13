import { Test, TestingModule } from '@nestjs/testing';
import { UserMobileController } from './user-mobile.controller';

describe('UserMobileController', () => {
    let controller: UserMobileController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserMobileController],
        }).compile();

        controller = module.get<UserMobileController>(
            UserMobileController,
        );
    });

    it('sanity check', () => {
        expect(controller).toBeDefined();
    });
});
