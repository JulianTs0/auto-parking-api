import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../models/user.model';
import { ArrayContains, In, Not, Repository } from 'typeorm';
import { Role, User, UserStatus, Page } from 'src/commons';
import { UserEntityMapper } from '../mapper/user-entity.mapper';

const EXCLUDED_STATUSES = [UserStatus.DELETED, UserStatus.BANNED];

@Injectable()
export class PostgresUserDao {
    constructor(
        @InjectRepository(UserModel)
        private readonly typeRepository: Repository<UserModel>,
    ) {}

    public async findById(id: string): Promise<UserModel | null> {
        const model = await this.typeRepository.findOne({
            where: {
                id: id,
                status: Not(In(EXCLUDED_STATUSES)),
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
                status: Not(In(EXCLUDED_STATUSES)),
            },
        });
    }

    public async existsByEmail(email: string): Promise<boolean> {
        return await this.typeRepository.exists({
            where: {
                email: email,
            },
        });
    }

    public async findAll(): Promise<UserModel[]> {
        const models = await this.typeRepository.find({
            where: {
                status: Not(In(EXCLUDED_STATUSES)),
            },
        });
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

    public async findInactiveOwnersPaginated(
        page: number,
        size: number,
    ): Promise<Page<UserModel>> {
        const skip: number = (page - 1) * size;

        const [userModels, itemCount] =
            await this.typeRepository.findAndCount({
                where: {
                    status: UserStatus.INACTIVE,
                    roles: ArrayContains([Role.OWNER]),
                },
                skip: skip,
                take: size,
                order: {
                    createdAt: 'DESC',
                },
            });

        return new Page(userModels, itemCount, page, size);
    }
}
