import { AuthReq } from '../../dto/auth/request/auth.request.dto';
import { AuthRes } from '../../dto/auth/response/auth.response.dto';
import { LoginReq } from '../../dto/auth/request/login.request.dto';
import { LoginRes } from '../../dto/auth/response/login.response.dto';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { VerifyEmailReq } from '../../dto/auth/request/verify-email.request.dto';
import { User } from 'src/commons';

export abstract class AuthServiceI {
    abstract auth(request: AuthReq): Promise<AuthRes>;
    abstract validateToken(rawToken: string): Promise<User>;
    abstract login(request: LoginReq): Promise<LoginRes>;
    abstract buildUser(request: RegisterReq): Promise<User>;
    abstract resendVerifyEmail(): Promise<void>;
    abstract verifyEmail(request: VerifyEmailReq): Promise<void>;
    abstract recoverPassword(): Promise<void>;
    abstract changePassword(): Promise<void>;
}
