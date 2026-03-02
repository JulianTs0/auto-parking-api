import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config';
import { AuthModule } from 'src/auth/';

import { UserModel } from './persistance/datasource/data/postgres/models/user.model';
import { PostgresUserDao } from './persistance/datasource/data/postgres/dao/postgres-user.dao';
import { UserRepository } from './persistance/repository/user.repository';

import { UserRepositoryI } from './domain/repository/user-repository.interface';
import { UserServiceI } from './domain/services/core/user-service.interface';
import { UserWebServiceI } from './domain/services/web/user-web-service.interface';
import { UserMobileServiceI } from './domain/services/mobile/user-mobile-service.interface';

import { UserService } from './domain/services/core/user.service';
import { UserWebService } from './domain/services/web/user-web.service';
import { UserMobileService } from './domain/services/mobile/user-mobile.service';

import { UserWebController } from './presentation/controllers/web/user-web.controller';
import { UserMobileController } from './presentation/controllers/mobile/user-mobile.controller';
import { UserCoreController } from './presentation/controllers/core/user-core.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserModel]),
        AppConfigModule,
        forwardRef(() => AuthModule),
    ],
    controllers: [
        UserWebController,
        UserMobileController,
        UserCoreController,
    ],
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
    exports: [UserService, UserRepository, UserServiceI],
})
export class UsersModule { }
