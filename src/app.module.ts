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
        }),
        AppConfigModule,
        AuthModule,
        UsersModule,
        DatabaseModule,
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
export class AppModule {}
