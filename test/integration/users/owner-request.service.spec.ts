import { Test, TestingModule } from '@nestjs/testing';
import { OwnerRequestService } from '../../../src/users/domain/services/core/owner-request.service';
import { OwnerRequestInternalServiceI } from '../../../src/users/domain/services/core/owner-request-service.interface';

describe('OwnerRequestService (Integration)', () => {
    let service: OwnerRequestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OwnerRequestService,
                {
                    provide: OwnerRequestInternalServiceI,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<OwnerRequestService>(
            OwnerRequestService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
