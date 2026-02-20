import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvConfigService } from 'src/config/env.service';
import { AppConfigModule } from 'src/config/config.module';

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
                synchronize: configService.isSync,
            }),
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
