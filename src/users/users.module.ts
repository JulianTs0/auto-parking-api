import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/config.module';

// Config
import {
    BcryptEncoder,
    JWTHandler,
    PasswordEncoderI,
    TokenHandlerI,
    AuthHelper,
} from './config';

// Persistence
import {
    UserModel,
    PostgresUserDao,
    UserRepository,
} from './persistance';

// Domain Imports
import {
    UserRepositoryI,
    AuthServiceI,
    UserServiceI,
    AuthWebServiceI,
    UserWebServiceI,
    AuthMobileServiceI,
    UserMobileServiceI,
    AuthService,
    UserService,
    AuthWebService,
    UserWebService,
    AuthMobileService,
    UserMobileService,
} from './domain';

// Presentation
import {
    AuthWebController,
    UserWebController,
    AuthMobileController,
    UserMobileController,
} from './presentation';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserModel]),
        AppConfigModule,
        JwtModule.register({}),
    ],
    controllers: [
        AuthWebController,
        UserWebController,
        AuthMobileController,
        UserMobileController,
    ],
    providers: [
        // Helpers
        AuthHelper,

        // DAO
        PostgresUserDao,

        // Config Providers
        { provide: PasswordEncoderI, useClass: BcryptEncoder },
        { provide: TokenHandlerI, useClass: JWTHandler },

        // Repository
        UserRepository,
        { provide: UserRepositoryI, useExisting: UserRepository },

        // Core Services
        AuthService,
        { provide: AuthServiceI, useExisting: AuthService },
        UserService,
        { provide: UserServiceI, useExisting: UserService },

        // Web Services
        AuthWebService,
        { provide: AuthWebServiceI, useExisting: AuthWebService },
        UserWebService,
        { provide: UserWebServiceI, useExisting: UserWebService },

        // Mobile Services
        AuthMobileService,
        {
            provide: AuthMobileServiceI,
            useExisting: AuthMobileService,
        },
        UserMobileService,
        {
            provide: UserMobileServiceI,
            useExisting: UserMobileService,
        },
    ],
    exports: [AuthService, UserService, UserRepository],
})
export class UsersModule {}
