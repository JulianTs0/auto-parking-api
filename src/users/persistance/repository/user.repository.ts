import { Injectable } from '@nestjs/common';
import { User, PageContent, Page } from 'src/commons';
import { UserRepositoryI } from '../../domain/repository/user-repository.interface';
import { PostgresUserDao } from '../datasource/data/postgres/dao/postgres-user.dao';
import { UserEntityMapper } from '../datasource/data/postgres/mapper/user-entity.mapper';
import { UserModel } from '../datasource/data/postgres/models/user.model';

@Injectable()
export class UserRepository implements UserRepositoryI {
    constructor(private readonly dao: PostgresUserDao) {}

    public async findById(id: string): Promise<User | null> {
        const model = await this.dao.findById(id);
        return UserEntityMapper.toDomain(model);
    }

    public async findByEmail(email: string): Promise<User | null> {
        const model = await this.dao.findByEmail(email);
        return UserEntityMapper.toDomain(model);
    }

    public async existsByEmail(email: string): Promise<boolean> {
        const response = await this.dao.existsByEmail(email);
        return response;
    }

    public async findInactiveOwnersPaginated(
        size: number,
        page: number,
    ): Promise<PageContent<User>> {
        const models: Page<UserModel> =
            await this.dao.findInactiveOwnersPaginated(page, size);

        return new PageContent<User>({
            content: UserEntityMapper.toDomainList(models.content),
            page: models.page,
            nextPage: models.hasNext ? models.page + 1 : null,
        });
    }

    public async findAll(): Promise<User[]> {
        const models = await this.dao.findAll();
        return UserEntityMapper.toDomainList(models);
    }

    public async save(user: User): Promise<User> {
        const model = await this.dao.save(user);
        return UserEntityMapper.toDomain(model)!;
    }

    public async update(user: User): Promise<User> {
        const model = await this.dao.save(user);
        return UserEntityMapper.toDomain(model)!;
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.dao.delete(id);
        return result;
    }
}
