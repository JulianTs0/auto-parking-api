import { AuthServiceI } from '../core/auth-service.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthMobileServiceI } from './auth-mobile-service.interface';
import { Injectable } from '@nestjs/common';
import { UserInternalServiceI } from 'src/users';
import { AuthEvents } from 'src/auth';
import { Errors, Role, ServiceError, Token, User } from 'src/commons';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { EventPublisherI } from '../../../../app-events/services/event-publisher.interface';

@Injectable()
export class AuthMobileService implements AuthMobileServiceI {
    constructor(
        private readonly authCoreService: AuthServiceI,
        private readonly userService: UserInternalServiceI,
        private readonly authHelper: AuthHelper,
        private readonly eventPublisher: EventPublisherI,
    ) {}

    @Transactional()
    public async register(request: RegisterReq) {
        const emailCheck: boolean =
            await this.userService.existsUserByEmail(request.email);

        if (emailCheck) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.buildUser(request);

        user.roles.add(Role.CLIENT);

        const saved: User = await this.userService.saveUser(user);

        const token: Token = await this.authHelper.createToken(saved);

        this.eventPublisher.emit(AuthEvents.REGISTER, {
            user: saved,
            token,
        });
    }
}
