import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ClsServiceManager } from 'nestjs-cls';

const correlationIdFormat = winston.format((info) => {
    const cls = ClsServiceManager.getClsService();

    if (cls && cls.isActive()) {
        info.correlationId = cls.getId();
    }

    return info;
});

@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        correlationIdFormat(),
                        winston.format.json(),
                    ),
                }),
            ],
        }),
    ],
    exports: [WinstonModule],
})
export class AppLoggerModule {}
