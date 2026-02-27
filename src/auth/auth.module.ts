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
    AuthGuard,
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
    AuthCoreController,
} from './presentation';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AppEventsModule } from 'src/app-events/app-events.module';
@Module({
    imports: [
        forwardRef(() => UsersModule),
        NotificationsModule,
        AppConfigModule,
        AppEventsModule,
        JwtModule.register({}),
    ],
    controllers: [
        AuthWebController,
        AuthMobileController,
        AuthCoreController,
    ],
    providers: [
        // Config Providers (must be before AuthHelper)
        {
            provide: PasswordEncoderI,
            useClass: BcryptEncoder,
        },
        {
            provide: TokenHandlerI,
            useClass: JWTHandler,
        },

        // Helpers
        AuthHelper,

        AuthGuard,

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
    exports: [
        AuthService,
        AuthHelper,
        AuthServiceI,
        AuthWebServiceI,
        AuthMobileServiceI,
        AuthGuard,
    ],
})
export class AuthModule {}
