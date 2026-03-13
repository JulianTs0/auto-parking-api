import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserModel } from '../../src/users/persistance/datasource/data/postgres/models/user.model';
import { UserEntityMapper } from '../../src/users/persistance/datasource/data/postgres/mapper/user-entity.mapper';
import { IdGenerator, User } from '../../src/commons';
import { createUserFixture } from '../fixtures/auth.fixtures';

export const seedUser = async (
    userTypeOrmRepo: Repository<UserModel>,
    overrides = {},
): Promise<User> => {
    const id = IdGenerator.generateUUID();
    const data = createUserFixture({ id, ...overrides });

    const model = UserEntityMapper.toModel(data as any);
    await userTypeOrmRepo.save(model!);
    return Object.assign(new User(), data);
};

export const createIntegrationModuleConfig = (entities: any[]) => ({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5433', 10),
            username: process.env.DB_USERNAME || 'tester',
            password: process.env.DB_PASSWORD || 'tester',
            database: process.env.DB_DATABASE || 'auto_parking_test',
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
