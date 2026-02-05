import { Injectable } from '@nestjs/common';
import { User } from 'src/commons';
import { UserRepositoryI } from 'src/users/domain';
import { PostgresUserDao } from '../datasource/data/postgres/dao/postgres-user.dao';
import { UserEntityMapper } from '../datasource/data/postgres/mapper/user-entity.mapper';

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

    public async findAll(): Promise<User[]> {
        const models = await this.dao.findAll();
        return UserEntityMapper.toDomainList(models);
    }

    public async save(user: User): Promise<User> {
        const model = await this.dao.save(user);
        return UserEntityMapper.toDomain(model)!;
    }

    public async update(user: User): Promise<User> {
        const model = await this.dao.update(user);
        return UserEntityMapper.toDomain(model)!;
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.dao.delete(id);
        return result;
    }
}
