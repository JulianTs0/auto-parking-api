import { Injectable } from '@nestjs/common';
import { OwnerRequestRepositoryI } from '../../domain/repository/owner-request-repository.interface';
import { PostgresOwnerRequestDao } from '../datasource/data/postgres/dao/postgres-owner-request.dao';
import { OwnerRequest, PageContent } from 'src/commons';
import { OwnerRequestLoadProfile } from '../datasource/data/postgres/profiles/owner-request-load.profile';
import { OwnerRequestEntityMapper } from '../datasource/data/postgres/mapper/owner-request-entity.mapper';

@Injectable()
export class OwnerRequestRepository implements OwnerRequestRepositoryI {
    constructor(
        private readonly postgresDao: PostgresOwnerRequestDao,
    ) {}

    public async save(request: OwnerRequest): Promise<OwnerRequest> {
        const model = await this.postgresDao.save(request);

        return OwnerRequestEntityMapper.toDomain(model)!;
    }

    public async update(
        request: OwnerRequest,
    ): Promise<OwnerRequest> {
        const model = await this.postgresDao.update(request);

        return OwnerRequestEntityMapper.toDomain(model)!;
    }

    public async findById(
        id: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null> {
        const model = await this.postgresDao.findById(id, profile);

        return model
            ? OwnerRequestEntityMapper.toDomain(model)
            : null;
    }

    public async findPendingByUserEmail(
        email: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null> {
        const model = await this.postgresDao.findPendingByUserEmail(
            email,
            profile,
        );

        return model
            ? OwnerRequestEntityMapper.toDomain(model)
            : null;
    }

    public async findByUserEmail(
        email: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null> {
        const model = await this.postgresDao.findByUserEmail(
            email,
            profile,
        );

        return model
            ? OwnerRequestEntityMapper.toDomain(model)
            : null;
    }

    public async findRequestsPaginated(
        page: number,
        size: number,
        profile?: OwnerRequestLoadProfile,
    ): Promise<PageContent<OwnerRequest>> {
        const pageModel =
            await this.postgresDao.findRequestsPaginated(
                page,
                size,
                profile,
            );

        return new PageContent<OwnerRequest>({
            content: OwnerRequestEntityMapper.toDomainList(
                pageModel.content,
            ),
            page: pageModel.page,
            nextPage: pageModel.nextPage,
        });
    }

    public async delete(id: string): Promise<boolean> {
        return await this.postgresDao.delete(id);
    }
}
