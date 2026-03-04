import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from '../../../src/users/persistance/repository/user.repository';
import { UserRepositoryI } from '../../../src/users/domain/repository/user-repository.interface';
import { User } from '../../../src/commons/entity/user.entity';

describe('UserRepository (Integration)', () => {
    let repository: UserRepositoryI;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn(),
                        find: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<UserRepositoryI>(UserRepositoryI);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });
});
