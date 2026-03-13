import { AuthReq } from '../../dto/auth/request/auth.request.dto';
import { AuthRes } from '../../dto/auth/response/auth.response.dto';
import { LoginReq } from '../../dto/auth/request/login.request.dto';
import { LoginRes } from '../../dto/auth/response/login.response.dto';
import { RegisterReq } from '../../dto/auth/request/register.request.dto';
import { VerifyEmailReq } from '../../dto/auth/request/verify-email.request.dto';
import { User } from 'src/commons';
import { RecoverPasswordReq } from '../../dto/auth/request/recover-password.request.dto';
import { EditPasswordReq } from '../../dto/auth/request/edit-password.request.dto';
import { ResendEmailReq } from '../../dto/auth/request/resend-email.request.dto';

export abstract class AuthServiceI {
    abstract auth(request: AuthReq): Promise<AuthRes>;
    abstract validateToken(rawToken: string): Promise<User>;
    abstract login(request: LoginReq): Promise<LoginRes>;
    abstract buildUser(request: RegisterReq): Promise<User>;
    abstract resendVerifyEmail(
        request: ResendEmailReq,
    ): Promise<void>;
    abstract verifyEmail(request: VerifyEmailReq): Promise<void>;
    abstract recoverPassword(
        request: RecoverPasswordReq,
    ): Promise<void>;
    abstract changePassword(request: EditPasswordReq): Promise<void>;
}
