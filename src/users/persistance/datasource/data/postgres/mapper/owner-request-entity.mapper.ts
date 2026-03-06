import { OwnerRequest } from 'src/commons';
import { OwnerRequestModel } from '../models/owner-request.model';
import { UserEntityMapper } from './user-entity.mapper';

export class OwnerRequestEntityMapper {
    public static toDomain(
        model: OwnerRequestModel | null,
    ): OwnerRequest | null {
        if (model == null) return null;

        const entity = new OwnerRequest();
        entity.id = model.id;
        entity.status = model.status;
        entity.createdAt = model.createdAt;
        entity.updatedAt = model.updatedAt;
        entity.user = model.user
            ? UserEntityMapper.toDomain(model.user)!
            : undefined;

        return entity;
    }

    public static toModel(
        entity: OwnerRequest | null,
    ): OwnerRequestModel | null {
        if (entity == null) return null;

        const model = new OwnerRequestModel();
        model.id = entity.id;
        model.status = entity.status;
        model.createdAt = entity.createdAt;
        model.updatedAt = entity.updatedAt;

        if (entity.user) {
            model.user = UserEntityMapper.toModel(entity.user)!;
        }

        return model;
    }

    public static toDomainList(
        models: OwnerRequestModel[],
    ): OwnerRequest[] {
        if (models == null) return [];

        return models
            .map((m) => this.toDomain(m))
            .filter((e): e is OwnerRequest => e != null);
    }

    public static toModelList(
        entities: OwnerRequest[],
    ): OwnerRequestModel[] {
        if (entities == null) return [];

        return entities
            .map((e) => this.toModel(e))
            .filter((m): m is OwnerRequestModel => m != null);
    }
}
