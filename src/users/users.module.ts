import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config';
import { AuthModule } from 'src/auth/';

import { UserModel } from './persistance/datasource/data/postgres/models/user.model';
import { OwnerRequestModel } from './persistance/datasource/data/postgres/models/owner-request.model';
import { PostgresUserDao } from './persistance/datasource/data/postgres/dao/postgres-user.dao';
import { PostgresOwnerRequestDao } from './persistance/datasource/data/postgres/dao/postgres-owner-request.dao';
import { UserRepository } from './persistance/repository/user.repository';
import { OwnerRequestRepository } from './persistance/repository/owner-request.repository';

import { UserRepositoryI } from './domain/repository/user-repository.interface';
import { OwnerRequestRepositoryI } from './domain/repository/owner-request-repository.interface';
import { UserServiceI } from './domain/services/core/user-service.interface';
import { OwnerRequestServiceI } from './domain/services/core/owner-request-service.interface';
import { UserWebServiceI } from './domain/services/web/user-web-service.interface';
import { UserMobileServiceI } from './domain/services/mobile/user-mobile-service.interface';

import { UserService } from './domain/services/core/user.service';
import { OwnerRequestService } from './domain/services/core/owner-request.service';
import { UserWebService } from './domain/services/web/user-web.service';
import { UserMobileService } from './domain/services/mobile/user-mobile.service';

import { UserWebController } from './presentation/controllers/web/user-web.controller';
import { UserMobileController } from './presentation/controllers/mobile/user-mobile.controller';
import { UserCoreController } from './presentation/controllers/core/user-core.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserModel, OwnerRequestModel]),
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
        PostgresOwnerRequestDao,

        // Repository
        UserRepository,
        {
            provide: UserRepositoryI,
            useExisting: UserRepository,
        },
        OwnerRequestRepository,
        {
            provide: OwnerRequestRepositoryI,
            useExisting: OwnerRequestRepository,
        },

        // Core Services
        UserService,
        {
            provide: UserServiceI,
            useExisting: UserService,
        },
        OwnerRequestService,
        {
            provide: OwnerRequestServiceI,
            useExisting: OwnerRequestService,
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
    exports: [
        UserService,
        UserRepository,
        UserServiceI,
        UserRepositoryI,
        OwnerRequestService,
        OwnerRequestServiceI,
        OwnerRequestRepository,
        OwnerRequestRepositoryI,
    ],
})
export class UsersModule {}
