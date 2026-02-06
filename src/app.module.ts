import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import {
    GlobalExceptionHandler,
    GlobalConstraintHandler,
} from './commons';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

@Module({
    imports: [AppConfigModule, UsersModule],
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
