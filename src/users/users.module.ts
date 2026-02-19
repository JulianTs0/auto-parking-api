import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/config.module';
import { AuthModule } from 'src/auth/auth.module';

// Persistence
import {
    UserModel,
    PostgresUserDao,
    UserRepository,
} from './persistance';

// Domain Imports
import {
    UserRepositoryI,
    UserServiceI,
    UserWebServiceI,
    UserMobileServiceI,
    UserService,
    UserWebService,
    UserMobileService,
} from './domain';

// Presentation
import {
    UserWebController,
    UserMobileController,
} from './presentation';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserModel]),
        AppConfigModule,
        forwardRef(() => AuthModule),
    ],
    controllers: [UserWebController, UserMobileController],
    providers: [
        // DAO
        PostgresUserDao,

        // Repository
        UserRepository,
        {
            provide: UserRepositoryI,
            useExisting: UserRepository,
        },

        // Core Services
        UserService,
        {
            provide: UserServiceI,
            useExisting: UserService,
        },

        // Web Services
        UserWebService,
        {
            provide: UserWebServiceI,
            useExisting: UserWebService,
        },

        // Mobile Services
        UserMobileService,
        {
            provide: UserMobileServiceI,
            useExisting: UserMobileService,
        },
    ],
    exports: [UserService, UserRepository],
})
export class UsersModule {}
