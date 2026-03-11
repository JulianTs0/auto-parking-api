import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserModel } from '../../src/users/persistance/datasource/data/postgres/models/user.model';
import { UserEntityMapper } from '../../src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { IdGenerator, User } from '../../src/commons';

export const seedUser = async (
    userTypeOrmRepo: Repository<UserModel>,
    overrides = {},
): Promise<User> => {
    const user = {
        id: IdGenerator.generateUUID(),
        email: 'test@example.com',
        passwordHash: 'hashedPassword123',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        roles: new Set(),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as unknown as User;

    const model = UserEntityMapper.toModel(user);
    await userTypeOrmRepo.save(model!);
    return Object.assign(new User(), user);
};

export const createIntegrationModuleConfig = (entities: any[]) => ({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5433,
            username: 'tester',
            password: 'tester',
            database: 'auto_parking_test',
            entities,
            synchronize: true,
            dropSchema: true,
        }),
        TypeOrmModule.forFeature(entities.filter((e) => e?.name)),
    ],
});

export const getTestingModuleProviders = (
    additionalProviders: any[] = [],
) => [...additionalProviders];
