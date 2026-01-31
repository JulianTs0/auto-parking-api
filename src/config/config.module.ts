import { Module } from '@nestjs/common';
import { EnvConfigModule } from './env/env.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [EnvConfigModule, DatabaseModule],
    exports: [EnvConfigModule, DatabaseModule],
})
export class AppConfigModule {}
