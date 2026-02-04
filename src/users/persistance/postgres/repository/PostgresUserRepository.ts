import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../models/UserModel';
import { Not, Repository } from 'typeorm';
import { User, UserStatus } from 'src/commons';
import { UserEntityMapper } from '../mapper/UserEntityMapper';

@Injectable()
export class PostgresUserRepository {
    constructor(
        @InjectRepository(UserModel)
        private readonly typeRepository: Repository<UserModel>,
    ) { }

    public async findById(id: string): Promise<UserModel | null> {
        const model = await this.typeRepository.findOne({
            where: {
                id: id,
                status: UserStatus.ACTIVE,
            },
        });
        return model;
    }

    public async findByEmail(
        email: string,
    ): Promise<UserModel | null> {
        return await this.typeRepository.findOne({
            where: {
                email: email,
                status: Not([UserStatus.DELETED, UserStatus.BANNED]),
            },
        });
    }

    public async findAll(): Promise<UserModel[]> {
        const models = await this.typeRepository.find();
        return models;
    }

    public async save(user: User): Promise<UserModel> {
        const userModel = UserEntityMapper.toModel(user);
        const saved = await this.typeRepository.save(userModel!);
        return saved;
    }

    public async update(user: User): Promise<UserModel> {
        const userModel = UserEntityMapper.toModel(user);
        const updated = await this.typeRepository.save(userModel!);
        return updated;
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.typeRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
