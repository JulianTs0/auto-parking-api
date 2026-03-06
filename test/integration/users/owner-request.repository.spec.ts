import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OwnerRequestRepository } from '../../../src/users/persistance/repository/owner-request.repository';
import { OwnerRequestRepositoryI } from '../../../src/users/domain/repository/owner-request-repository.interface';

describe('OwnerRequestRepository (Integration)', () => {
    let repository: OwnerRequestRepositoryI;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OwnerRequestRepository,
                {
                    provide: getRepositoryToken(
                        OwnerRequestRepository,
                    ),
                    useValue: {},
                },
            ],
        }).compile();

        repository = module.get<OwnerRequestRepositoryI>(
            OwnerRequestRepositoryI,
        );
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });
});
