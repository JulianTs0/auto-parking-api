import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Errors, ServiceError } from 'src/commons';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: parseInt(
                    configService.getOrThrow<string>('DB_PORT'),
                ),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_DATABASE'),
                autoLoadEntities: true,
                synchronize: true,
            }),
            dataSourceFactory: async (options) => {
                if (!options) {
                    throw new ServiceError(Errors.INTERNAL_ERROR);
                }
                return addTransactionalDataSource(
                    new DataSource(options),
                );
            },
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
