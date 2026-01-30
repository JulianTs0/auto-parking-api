import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { GlobalExceptionHandler } from './commons/error/GlobalExceptionHandler';
import { APP_FILTER } from '@nestjs/core';

@Module({
    imports: [AppConfigModule],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionHandler,
        },
    ],
})
export class AppModule {}
