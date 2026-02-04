import { Injectable } from '@nestjs/common';
import { User } from 'src/commons';
import { UserRepositoryI } from 'src/users/domain';
import {
    PostgresUserRepository,
    UserEntityMapper,
} from 'src/users/persistance';

@Injectable()
export class UserRepository implements UserRepositoryI {
    constructor(
        private readonly repository: PostgresUserRepository,
    ) { }

    public async findById(id: string): Promise<User | null> {
        const model = await this.repository.findById(id);
        return UserEntityMapper.toDomain(model);
    }

    public async findByEmail(email: string): Promise<User | null> {
        const model = await this.repository.findByEmail(email);
        return UserEntityMapper.toDomain(model);
    }

    public async findAll(): Promise<User[]> {
        const models = await this.repository.findAll();
        return UserEntityMapper.toDomainList(models);
    }

    public async save(user: User): Promise<User> {
        const model = await this.repository.save(user);
        return UserEntityMapper.toDomain(model)!;
    }

    public async update(user: User): Promise<User> {
        const model = await this.repository.update(user);
        return UserEntityMapper.toDomain(model)!;
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result;
    }
}
