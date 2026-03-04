import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../src/users/domain/services/core/user.service';
import { UserServiceI } from '../../../src/users/domain/services/core/user-service.interface';
import { UserRepositoryI } from '../../../src/users/domain/repository/user-repository.interface';

describe('UserService (Integration)', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserServiceI,
                    useValue: {},
                },
                {
                    provide: UserRepositoryI,
                    useValue: {
                        findById: jest.fn(),
                        findAll: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
