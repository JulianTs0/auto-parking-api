import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import {
    GlobalExceptionHandler,
    GlobalConstraintHandler,
} from './commons';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

@Module({
    imports: [AppConfigModule],
    controllers: [AppController],
    providers: [
        AppService,
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
