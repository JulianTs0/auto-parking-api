import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
                synchronize: configService.isSync,
            }),
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
