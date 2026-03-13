import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { AuthServiceI } from '../core/auth-service.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthEvents } from 'src/auth/config/utils/auth-events.enum';
import {
    Errors,
    IdGenerator,
    PageContent,
    Role,
    ServiceError,
    Token,
    User,
    UserStatus,
    OwnerRequest,
    OwnerRequestStatus,
} from 'src/commons';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { UserInternalServiceI } from 'src/users/domain/services/core/user-service.interface';
import { OwnerRequestInternalServiceI } from 'src/users/domain/services/core/owner-request-service.interface';
import { OwnerRequestLoadProfile } from 'src/users/persistance/datasource/data/postgres/profiles/owner-request-load.profile';
import { EventPublisherI } from 'src/app-events/services/event-publisher.interface';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';
import { RequestOwnerUpgradeReq } from '../../dto/auth/request/request-owner-upgrade-request.dto';
import { UpgradeToOwnerReq } from '../../dto/auth/request/upgrade-to-owner.request.dto';
import { GetOwnerRequestReq } from '../../dto/auth/request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../dto/auth/response/get-owner-request.response.dto';
import { AuthMapper } from '../../dto/auth/mapper/auth.mapper';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthServiceI,
        private readonly authHelper: AuthHelper,
        private readonly userService: UserInternalServiceI,
        private readonly ownerRequestService: OwnerRequestInternalServiceI,
        private readonly eventPublisher: EventPublisherI,
    ) {}

    @Transactional()
    public async register(request: RegisterReq) {
        const existingUser: User | null =
            await this.userService.findUserByEmail(request.email);

        if (existingUser) {
            if (
                existingUser.roles.has(Role.CLIENT) &&
                !existingUser.roles.has(Role.OWNER)
            ) {
                throw new ServiceError(Errors.CLIENT_ALREADY_EXISTS);
            }
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const user: User =
            await this.authCoreService.buildUser(request);

        user.roles = new Set([Role.CLIENT]);
        user.status = UserStatus.INACTIVE;

        const savedUser = await this.userService.saveUser(user);

        const ownerRequest = new OwnerRequest();
        ownerRequest.id = IdGenerator.generateUUID();
        ownerRequest.user = savedUser;
        ownerRequest.status = OwnerRequestStatus.PENDING;

        await this.ownerRequestService.save(ownerRequest);
    }

    @Transactional()
    public async acceptOwnerRequest(
        request: AcceptOwnerRequestReq,
    ): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(
                request.body.ownerEmail,
            );

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        const ownerRequest: OwnerRequest | null =
            await this.ownerRequestService.findPendingByUserId(
                user.id,
                OwnerRequestLoadProfile.WITH_USER,
            );

        if (!ownerRequest) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        ownerRequest.status = OwnerRequestStatus.APPROVED;
        await this.ownerRequestService.update(ownerRequest);

        const token: Token = await this.authHelper.createToken(
            ownerRequest.user,
        );

        this.eventPublisher.emit(AuthEvents.REGISTER, {
            user: ownerRequest.user,
            token,
        });
    }

    @Transactional()
    public async registerEmployee(
        request: RegisterEmployeeReq,
    ): Promise<void> {
        const userCheck: User | null =
            await this.userService.findUserByEmail(
                request.body.email,
            );

        if (userCheck) {
            if (!userCheck.roles.has(Role.EMPLOYEE)) {
                userCheck.roles.add(Role.EMPLOYEE);
            }

            await this.userService.updateUser(userCheck);

            return;
        }

        const user: User = await this.authCoreService.buildUser(
            request.body,
        );

        user.roles = new Set([Role.CLIENT, Role.EMPLOYEE]);

        const saved: User = await this.userService.saveUser(user);

        const token: Token = await this.authHelper.createToken(saved);

        this.eventPublisher.emit(AuthEvents.EMPLOYEE_REGISTER, {
            user: saved,
            token: token,
            ownerFullName: request.authUser.fullName,
            ownerEmail: request.authUser.email,
        });
    }

    @Transactional()
    public async requestOwnerUpgrade(
        request: RequestOwnerUpgradeReq,
    ): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(
                request.body.email,
            );

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        if (user.roles.has(Role.OWNER)) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const existingRequest =
            await this.ownerRequestService.findPendingByUserId(
                user.id,
            );

        if (existingRequest) {
            throw new ServiceError(
                Errors.OWNER_REQUEST_ALREADY_EXISTS,
            );
        }

        const ownerRequest = new OwnerRequest();
        ownerRequest.id = IdGenerator.generateUUID();
        ownerRequest.user = user;
        ownerRequest.status = OwnerRequestStatus.PENDING;

        await this.ownerRequestService.save(ownerRequest);
    }

    @Transactional()
    public async upgrade(request: UpgradeToOwnerReq): Promise<void> {
        const user: User | null =
            await this.userService.findUserByEmail(
                request.body.email,
            );

        if (!user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        const ownerRequest =
            await this.ownerRequestService.findByUserId(user.id);

        if (
            !ownerRequest ||
            ownerRequest.status !== OwnerRequestStatus.APPROVED
        ) {
            throw new ServiceError(Errors.OWNER_REQUEST_NOT_FOUND);
        }

        user.roles.add(Role.OWNER);
        user.status = UserStatus.ACTIVE;

        await this.userService.updateUser(user);

        ownerRequest.status = OwnerRequestStatus.COMPLETED;
        await this.ownerRequestService.update(ownerRequest);
    }

    @Transactional()
    public async getOwnerRequests(
        request: GetOwnerRequestReq,
    ): Promise<GetOwnerRequestRes> {
        const models: PageContent<OwnerRequest> =
            await this.ownerRequestService.findRequestsPaginated(
                request.page,
                request.size,
                OwnerRequestLoadProfile.WITH_USER,
            );

        return AuthMapper.getOwnerRequest().toResponse(models);
    }
}
