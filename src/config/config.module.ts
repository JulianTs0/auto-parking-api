import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfigService } from './env.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
    ],
    providers: [AppConfigModule, EnvConfigService],
    exports: [AppConfigModule, EnvConfigService],
})
export class AppConfigModule {}
