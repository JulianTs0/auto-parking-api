import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AppConfigModule } from 'src/config/config.module';
import { AppEventsModule } from 'src/app-events/app-events.module';

import { BcryptEncoder } from './config/providers/bcrypt-encoder.provider';
import { JWTHandler } from './config/providers/jwt-handler.provider';
import { PasswordEncoderI } from './config/providers/password-encoder.interface';
import { TokenHandlerI } from './config/providers/token-handler.interface';
import { AuthHelper } from './config/helpers/auth.helper';
import { AuthGuard } from './config/guards/auth.guard';
import { RolesGuard } from './config/guards/roles.guard';

import { AuthServiceI } from './domain/services/core/auth-service.interface';
import { AuthWebServiceI } from './domain/services/web/auth-web-service.interface';
import { AuthMobileServiceI } from './domain/services/mobile/auth-mobile-service.interface';
import { AuthService } from './domain/services/core/auth.service';
import { AuthWebService } from './domain/services/web/auth-web.service';
import { AuthMobileService } from './domain/services/mobile/auth-mobile.service';

import { AuthWebController } from './presentation/controllers/web/auth-web.controller';
import { AuthMobileController } from './presentation/controllers/mobile/auth-mobile.controller';
import { AuthCoreController } from './presentation/controllers/core/auth-core.controller';

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
        RolesGuard,

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
        RolesGuard,
    ],
})
export class AuthModule {}
