import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {
    GlobalExceptionHandler,
    GlobalConstraintHandler,
} from './commons';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from './database/database.module';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { DataSource } from 'typeorm';
import { AppLoggerModule } from './logger/logger.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppEventsModule } from './app-events/app-events.module';

@Module({
    imports: [
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
                generateId: true,
                idGenerator: (req: any) =>
                    req.headers['x-request-id'] ??
                    crypto.randomUUID(),
            },
            plugins: [
                new ClsPluginTransactional({
                    imports: [DatabaseModule],
                    adapter: new TransactionalAdapterTypeOrm({
                        dataSourceToken: DataSource,
                    }),
                }),
            ],
        }),
        AppConfigModule,
        AuthModule,
        UsersModule,
        DatabaseModule,
        AppLoggerModule,
        NotificationsModule,
        AppEventsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionHandler,
        },
        {
            provide: APP_PIPE,
            useClass: GlobalConstraintHandler,
        },
    ],
})
export class AppModule { }
