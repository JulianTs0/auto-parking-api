import { Module } from '@nestjs/common';
import {
    GlobalExceptionHandler,
    GlobalConstraintHandler,
} from './commons';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { DataSource } from 'typeorm';
import { DatabaseModule } from './database';
import { AppConfigModule } from './config';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { AppLoggerModule } from './logger';
import { NotificationsModule } from './notifications';
import { AppEventsModule } from './app-events';

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
