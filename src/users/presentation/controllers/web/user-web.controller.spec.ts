import { Test, TestingModule } from '@nestjs/testing';
import { UserWebController } from './user-web.controller';

describe('UserWebController', () => {
    let controller: UserWebController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserWebController],
        }).compile();

        controller = module.get<UserWebController>(UserWebController);
    });

    it('sanity check', () => {
        expect(controller).toBeDefined();
    });
});
