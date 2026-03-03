import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, EnvConfigService } from 'src/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [AppConfigModule],
            inject: [EnvConfigService],
            useFactory: (configService: EnvConfigService) => ({
                type: 'postgres',
                host: configService.dbHost,
                port: configService.dbPort,
                username: configService.dbUsername,
                password: configService.dbPassword,
                database: configService.dbName,
                autoLoadEntities: true,
                synchronize: configService.isDevelop,
            }),
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
