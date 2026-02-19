import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/config.module';
import { UsersModule } from 'src/users/users.module';

// Config
import {
    BcryptEncoder,
    JWTHandler,
    PasswordEncoderI,
    TokenHandlerI,
    AuthHelper,
} from './config';

// Domain Imports
import {
    AuthServiceI,
    AuthWebServiceI,
    AuthMobileServiceI,
    AuthService,
    AuthWebService,
    AuthMobileService,
} from './domain';

// Presentation
import {
    AuthWebController,
    AuthMobileController,
} from './presentation';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        AppConfigModule,
        JwtModule.register({}),
    ],
    controllers: [AuthWebController, AuthMobileController],
    providers: [
        // Helpers
        AuthHelper,

        // Config Providers
        {
            provide: PasswordEncoderI,
            useClass: BcryptEncoder,
        },
        {
            provide: TokenHandlerI,
            useClass: JWTHandler,
        },

        // Core Services
        AuthService,
        {
            provide: AuthServiceI,
            useExisting: AuthService,
        },

        // Web Services
        AuthWebService,
        {
            provide: AuthWebServiceI,
            useExisting: AuthWebService,
        },

        // Mobile Services
        AuthMobileService,
        {
            provide: AuthMobileServiceI,
            useExisting: AuthMobileService,
        },
    ],
    exports: [AuthService, AuthHelper],
})
export class AuthModule {}
