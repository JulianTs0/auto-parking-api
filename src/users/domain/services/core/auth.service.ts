import { AuthReq, AuthRes, RegisterReq } from 'src/users/domain';
import { AuthServiceI } from './auth-service.interface';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/users/data';
import {
    Errors,
    IdGenerator,
    Role,
    ServiceError,
    User,
    UserStatus,
} from 'src/commons';
import { AuthHelper } from 'src/users/config';

@Injectable()
export class AuthService implements AuthServiceI {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authHelper: AuthHelper,
    ) {}

    public async auth(request: AuthReq): Promise<AuthRes> {
        return Promise.resolve({} as AuthRes);
    }

    public async register(request: RegisterReq): Promise<void> {
        const emailCheck = this.userRepository.findByEmail(
            request.email,
        );

        if (emailCheck != null) {
            throw new ServiceError(Errors.EMAIL_ALREADY_EXISTS);
        }

        const generatedId: string = IdGenerator.generateUUID();
        const paswordHash: string =
            await this.authHelper.hashPassword(request.password);

        const user: User = new User();
        user.id = generatedId;
        user.fullName = request.fullName;
        user.email = request.email;
        user.passwordHash = paswordHash;
        user.status = UserStatus.INACTIVE;
        user.roles = new Set(Role.CLIENT);
        user.phoneNumber = request.phoneNumber ?? null;
        user.subscriptions = [];
        user.vehicles = [];
        user.paymentMethods = [];
        user.parkingLots = [];

        /*
           - Revisar el concepto de los roles, quizas hay que o crear un rol usuario, 
             dividir el sistema de registro en 2 dependiendo del cliente, quizas con mandar
             una vairable del especifico al core funciona
        */

        await this.userRepository.save(user);

        return Promise.resolve();
    }

    public async resendVerifyEmail(): Promise<void> {}

    public async verifyEmail(): Promise<void> {}

    public async recoverPassword(): Promise<void> {}

    public async changePassword(): Promise<void> {}
}
