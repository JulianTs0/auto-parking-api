import { AcceptOwnerRequestReq } from '../../dto/auth/request/accept-owner-request.request.dto';
import { AuthServiceI } from '../core/auth-service.interface';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { AuthWebServiceI } from './auth-web-service.interface';
import { Injectable } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { AuthEvents } from 'src/auth';
import {
    Errors,
    IdGenerator,
    PageContent,
    Role,
    ServiceError,
    Token,
    User,
    UserStatus,
} from 'src/commons';
import { AuthHelper } from '../../../config/helpers/auth.helper';
import { UserServiceI } from 'src/users';
import { EventPublisherI } from 'src/app-events';
import { RegisterEmployeeReq } from '../../dto/auth/request/register-employee.request.dto';
import { RequestOwnerUpgradeReq } from '../../dto/auth/request/request-owner-upgrade-request.dto';
import { UpgradeToOwnerReq } from '../../dto/auth/request/upgrade-to-owner.request.dto';
import { GetOwnerRequestReq } from '../../dto/auth/request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../dto/auth/response/get-owner-request.response.dto';
import { AuthMapper } from '../../dto/auth/mapper/auth.mapper';
import { OwnerRequest, OwnerRequestStatus } from 'src/commons';
import { OwnerRequestRepositoryI } from 'src/users/domain/repository/owner-request-repository.interface';
import { OwnerRequestLoadProfile } from 'src/users/persistance/datasource/data/postgres/profiles/owner-request-load.profile';

@Injectable()
export class AuthWebService implements AuthWebServiceI {
    constructor(
        private readonly authCoreService: AuthServiceI,
        private readonly authHelper: AuthHelper,
        private readonly userService: UserServiceI,
        private readonly ownerRequestRepository: OwnerRequestRepositoryI,
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

        await this.ownerRequestRepository.save(ownerRequest);

        return Promise.resolve();
    }

    @Transactional()
    public async acceptOwnerRequest(
        request: AcceptOwnerRequestReq,
    ): Promise<void> {
        if (!request.authUser.isAdmin()) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        const ownerRequest: OwnerRequest | null =
            await this.ownerRequestRepository.findPendingByUserEmail(
                request.body.ownerEmail,
                OwnerRequestLoadProfile.WITH_USER,
            );

        if (!ownerRequest || !ownerRequest.user) {
            throw new ServiceError(Errors.USER_NOT_FOUND);
        }

        ownerRequest.status = OwnerRequestStatus.APPROVED;
        await this.ownerRequestRepository.update(ownerRequest);

        const token: Token = await this.authHelper.createToken(
            ownerRequest.user,
        );

        await this.eventPublisher.emit(AuthEvents.REGISTER, {
            user: ownerRequest.user,
            token,
        });
    }

    @Transactional()
    public async registerEmployee(
        request: RegisterEmployeeReq,
    ): Promise<void> {
        if (!request.authUser.roles.has(Role.OWNER)) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

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

        await this.eventPublisher.emit(AuthEvents.EMPLOYEE_REGISTER, {
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

        if (!user.roles.has(Role.CLIENT)) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        if (user.roles.has(Role.OWNER)) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const existingRequest =
            await this.ownerRequestRepository.findPendingByUserEmail(
                user.email,
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

        await this.ownerRequestRepository.save(ownerRequest);
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
            await this.ownerRequestRepository.findByUserEmail(
                user.email,
                OwnerRequestLoadProfile.WITH_USER,
            );

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
        await this.ownerRequestRepository.update(ownerRequest);
    }

    public async getOwnerRequests(
        request: GetOwnerRequestReq,
    ): Promise<GetOwnerRequestRes> {
        if (!request.authUser.isAdmin()) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        const models: PageContent<OwnerRequest> =
            await this.ownerRequestRepository.findRequestsPaginated(
                request.page,
                request.size,
                OwnerRequestLoadProfile.WITH_USER,
            );

        return AuthMapper.getOwnerRequest().toResponse(models);
    }
}
