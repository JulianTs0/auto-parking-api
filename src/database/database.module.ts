import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Errors, ServiceError } from 'src/commons';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { EnvConfigService } from 'src/config/env.service';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: EnvConfigService) => ({
                type: 'postgres',
                host: configService.dbHost,
                port: configService.dbPort,
                username: configService.dbUsername,
                password: configService.dbPassword,
                database: configService.dbName,
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
