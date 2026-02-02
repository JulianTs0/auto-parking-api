import { Module } from '@nestjs/common';
import {
    BcryptEncoder,
    JWTHandler,
    PasswordEncoderI,
    TokenHandlerI,
} from './config';
import { AppConfigModule } from 'src/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './persistance';

@Module({
    imports: [TypeOrmModule.forFeature([UserModel]), AppConfigModule],
    controllers: [],
    providers: [
        {
            provide: PasswordEncoderI,
            useClass: BcryptEncoder,
        },
        {
            provide: TokenHandlerI,
            useClass: JWTHandler,
        },
    ],
})
export class UsersModule {}
