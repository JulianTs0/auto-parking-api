import {
    Body,
    Controller,
    Get,
    Headers,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthReq } from '../../../domain/dto/auth/request/auth.request.dto';
import { AuthRes } from '../../../domain/dto/auth/response/auth.response.dto';
import { AuthServiceI } from '../../../domain/services/core/auth-service.interface';
import { LoginReq } from '../../../domain/dto/auth/request/login.request.dto';
import { LoginRes } from '../../../domain/dto/auth/response/login.response.dto';
import { VerifyEmailReq } from '../../../domain/dto/auth/request/verify-email.request.dto';
import { ApiEndpoint, AuthUser, User } from 'src/commons';
import { RecoverPasswordReq } from 'src/auth/domain/dto/auth/request/recover-password.request.dto';
import { EditPasswordBody } from 'src/auth/domain/dto/auth/request/edit-password.body.dto';
import { AuthGuard } from 'src/auth/config/guards/auth.guard';
import { AuthMapper } from 'src/auth/domain/dto/auth/mapper/auth.mapper';
import { ResendEmailReq } from 'src/auth/domain/dto/auth/request/resend-email.request.dto';

@ApiTags('auth/core')
@Controller('auth')
export class AuthCoreController {
    constructor(private readonly authCoreService: AuthServiceI) {}

    @ApiEndpoint({
        summary: 'Iniciar sesión',
        description:
            'Autentica a un usuario y devuelve un token de acceso',
        type: LoginRes,
        body: LoginReq,
    })
    @Patch('/login')
    public async login(
        @Body() loginRequest: LoginReq,
    ): Promise<LoginRes> {
        return await this.authCoreService.login(loginRequest);
    }

    @ApiEndpoint({
        summary: 'Obtener usuario autenticado',
        description:
            'Obtiene la información del usuario actual basado en el token',
        type: AuthRes,
        isAuth: true,
    })
    @Get()
    public async auth(@Headers() request: AuthReq): Promise<AuthRes> {
        return await this.authCoreService.auth(request);
    }

    @ApiEndpoint({
        summary: 'Verifica el mail',
        description:
            'Verifica el mail del usuario, lo actualiza a activo',
        body: VerifyEmailReq,
    })
    @Patch('/verify')
    public async verifyEmail(
        @Body() request: VerifyEmailReq,
    ): Promise<void> {
        await this.authCoreService.verifyEmail(request);
    }

    @ApiEndpoint({
        summary: 'Recupera un token',
        description:
            'Recupera una token para poder cambiar la contraseña',
        body: RecoverPasswordReq,
    })
    @Post('/recover')
    public async recoverPassword(
        @Body() request: RecoverPasswordReq,
    ): Promise<void> {
        await this.authCoreService.recoverPassword(request);
    }

    @ApiEndpoint({
        summary: 'Reenvia el mail de registro',
        description: 'Reenvia el mail de registro',
        body: ResendEmailReq,
    })
    @Post('/email/resend')
    public async resendEmail(
        @Body() request: ResendEmailReq,
    ): Promise<void> {
        await this.authCoreService.resendVerifyEmail(request);
    }

    @ApiEndpoint({
        summary: 'Cambia la contraseña',
        description: 'Cambia la contraseña',
        body: EditPasswordBody,
        isAuth: true,
    })
    @Patch('/password')
    @UseGuards(AuthGuard)
    public async changePassword(
        @Body() body: EditPasswordBody,
        @AuthUser() authUser: User,
    ): Promise<void> {
        await this.authCoreService.changePassword(
            AuthMapper.editPassword().toRequest(body, authUser),
        );
    }
}
