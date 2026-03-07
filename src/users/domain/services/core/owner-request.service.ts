import { Injectable } from '@nestjs/common';
import { OwnerRequestInternalServiceI } from './owner-request-service.interface';
import { OwnerRequestRepositoryI } from '../../repository/owner-request-repository.interface';
import { OwnerRequest, PageContent } from 'src/commons';
import { OwnerRequestLoadProfile } from '../../../persistance/datasource/data/postgres/profiles/owner-request-load.profile';

@Injectable()
export class OwnerRequestService implements OwnerRequestInternalServiceI {
    constructor(
        private readonly ownerRequestRepository: OwnerRequestRepositoryI,
    ) {}

    public async save(request: OwnerRequest): Promise<OwnerRequest> {
        return await this.ownerRequestRepository.save(request);
    }

    public async update(
        request: OwnerRequest,
    ): Promise<OwnerRequest> {
        return await this.ownerRequestRepository.update(request);
    }

    public async findByUserId(
        userId: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null> {
        return await this.ownerRequestRepository.findByUserId(
            userId,
            profile,
        );
    }

    public async findPendingByUserId(
        userId: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null> {
        return await this.ownerRequestRepository.findPendingByUserId(
            userId,
            profile,
        );
    }

    public async findRequestsPaginated(
        page: number,
        size: number,
        profile?: OwnerRequestLoadProfile,
    ): Promise<PageContent<OwnerRequest>> {
        return await this.ownerRequestRepository.findRequestsPaginated(
            page,
            size,
            profile,
        );
    }
}
