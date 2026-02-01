import { Module } from '@nestjs/common';
import { PasswordEncoderI } from './config/providers/PasswordEncoderI';
import { BcryptEncoder } from './config/providers/BCryptEncoder';
import { TokenHandlerI } from './config/providers/TokenHandlerI';
import { JWTHandler } from './config/providers/JWTHandler';

@Module({
    imports: [],
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
export class UsersModule { }
