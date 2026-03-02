import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ClsServiceManager } from 'nestjs-cls';
import { AppConfigModule, EnvConfigService } from 'src/config';

const correlationIdFormat = winston.format((info) => {
    const cls = ClsServiceManager.getClsService();

    if (cls && cls.isActive()) {
        info.correlationId = cls.getId();
    }

    return info;
});

const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    correlationIdFormat(),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
        const {
            timestamp,
            level,
            message,
            context,
            correlationId,
            stack,
        } = info;

        let log = `[${timestamp}] [${level}]`;
        if (context) log += ` [${context}]`;
        if (correlationId) log += ` [ReqID: ${correlationId}]`;
        log += ` ${message}`;

        if (stack) log += `\n${stack}`;

        return log;
    }),
);

const productionFormat = winston.format.combine(
    winston.format.timestamp(),
    correlationIdFormat(),
    winston.format.json(),
);

@Global()
@Module({
    imports: [
        WinstonModule.forRootAsync({
            imports: [AppConfigModule],
            inject: [EnvConfigService],
            useFactory: (configService: EnvConfigService) => {
                const isDev: boolean = configService.isDevelop;

                return {
                    transports: [
                        new winston.transports.Console({
                            format: !isDev
                                ? productionFormat
                                : developmentFormat,

                            level: !isDev ? 'info' : 'debug',
                        }),
                    ],
                };
            },
        }),
    ],
    exports: [WinstonModule],
})
export class AppLoggerModule { }
