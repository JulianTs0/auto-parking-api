import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AuthMobileServiceI,
    AuthReq,
    AuthRes,
    AuthServiceI,
    LoginReq,
    LoginRes,
    RegisterReq,
} from 'src/auth/domain';
import { ApiEndpoint } from 'src/commons/decorators/api-endpoint.decorator';

@ApiTags('auth/mobile')
@Controller('mobile/auth')
export class AuthMobileController {
    constructor(
        private readonly authMobileService: AuthMobileServiceI,
        private readonly authCoreService: AuthServiceI,
    ) {}

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
        summary: 'Registrar usuario',
        description: 'Registra un nuevo usuario en la plataforma',
        status: HttpStatus.CREATED,
        body: RegisterReq,
    })
    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() request: RegisterReq): Promise<void> {
        return await this.authMobileService.register(request);
    }
}
