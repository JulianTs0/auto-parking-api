import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
    ],
    providers: [AppConfigModule],
    exports: [AppConfigModule],
})
export class AppConfigModule {}
