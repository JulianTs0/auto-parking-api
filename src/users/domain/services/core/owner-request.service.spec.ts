import { Test, TestingModule } from '@nestjs/testing';
import { OwnerRequestService } from './owner-request.service';

describe('OwnerRequestService', () => {
    let service: OwnerRequestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OwnerRequestService],
        }).compile();

        service = module.get<OwnerRequestService>(
            OwnerRequestService,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
