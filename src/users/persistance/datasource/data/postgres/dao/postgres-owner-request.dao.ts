import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { OwnerRequestModel } from '../models/owner-request.model';
import { OwnerRequestLoadProfile } from '../profiles/owner-request-load.profile';
import {
    OwnerRequest,
    OwnerRequestStatus,
    PageContent,
} from 'src/commons';
import { OwnerRequestEntityMapper } from '../mapper/owner-request-entity.mapper';

@Injectable()
export class PostgresOwnerRequestDao {
    constructor(
        @InjectRepository(OwnerRequestModel)
        private readonly typeRepository: Repository<OwnerRequestModel>,
    ) {}

    private getRelations(
        profile: OwnerRequestLoadProfile,
    ): FindOptionsRelations<OwnerRequestModel> {
        switch (profile) {
            case OwnerRequestLoadProfile.WITH_USER:
                return { user: true };
            case OwnerRequestLoadProfile.BASIC:
            default:
                return {};
        }
    }

    public async save(
        request: OwnerRequest,
    ): Promise<OwnerRequestModel> {
        const model = OwnerRequestEntityMapper.toModel(request);
        return await this.typeRepository.save(model!);
    }

    public async update(
        request: OwnerRequest,
    ): Promise<OwnerRequestModel> {
        const model = OwnerRequestEntityMapper.toModel(request);
        return await this.typeRepository.save(model!);
    }

    public async findById(
        id: string,
        profile: OwnerRequestLoadProfile = OwnerRequestLoadProfile.BASIC,
    ): Promise<OwnerRequestModel | null> {
        return this.typeRepository.findOne({
            where: { id },
            relations: this.getRelations(profile),
        });
    }

    public async findPendingByUserEmail(
        email: string,
        profile: OwnerRequestLoadProfile = OwnerRequestLoadProfile.BASIC,
    ): Promise<OwnerRequestModel | null> {
        return this.typeRepository.findOne({
            where: {
                user: { email: email },
                status: OwnerRequestStatus.PENDING,
            },
            relations: this.getRelations(profile),
        });
    }

    public async findByUserEmail(
        email: string,
        profile: OwnerRequestLoadProfile = OwnerRequestLoadProfile.BASIC,
    ): Promise<OwnerRequestModel | null> {
        return this.typeRepository.findOne({
            where: {
                user: { email: email },
            },
            relations: this.getRelations(profile),
        });
    }

    public async findRequestsPaginated(
        page: number,
        size: number,
        profile: OwnerRequestLoadProfile = OwnerRequestLoadProfile.BASIC,
    ): Promise<PageContent<OwnerRequestModel>> {
        const skip = (page - 1) * size;

        const [models, count] =
            await this.typeRepository.findAndCount({
                relations: this.getRelations(profile),
                skip,
                take: size,
                order: { createdAt: 'DESC' },
            });

        return new PageContent({
            content: models,
            page: page,
            nextPage: count > page * size ? page + 1 : null,
        });
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.typeRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
