import {
    Body,
    Controller,
    Get,
    Headers,
    Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AuthReq,
    AuthRes,
    AuthServiceI,
    LoginReq,
    LoginRes,
} from 'src/auth/domain';
import { VerifyEmailReq } from 'src/auth/domain/dto/auth/request/verify-email.request.dto';
import { ApiEndpoint } from 'src/commons/decorators/api-endpoint.decorator';

@ApiTags('auth/core')
@Controller('auth')
export class AuthCoreController {
    constructor(private readonly authCoreService: AuthServiceI) { }

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
}
