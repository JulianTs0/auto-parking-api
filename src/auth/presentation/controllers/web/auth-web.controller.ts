import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, ApiEndpoint, AuthUser } from 'src/commons';
import { AuthWebServiceI } from '../../../domain/services/web/auth-web-service.interface';
import { RegisterReq } from '../../../domain/dto/auth/request/register.request.dto';
import { AcceptOwnerRequestBody } from '../../../domain/dto/auth/request/accept-owner-request.body.dto';
import { AuthGuard } from '../../../config/guards/auth.guard';
import { AuthMapper } from '../../../domain/dto/auth/mapper/auth.mapper';
import { AcceptOwnerRequestReq } from 'src/auth/domain/dto/auth/request/accept-owner-request.request.dto';
import { RegisterEmployeeBody } from 'src/auth/domain/dto/auth/request/register-employee-body.dto';

@ApiTags('auth/web')
@Controller('web/auth')
export class AuthWebController {
    constructor(private readonly authWebService: AuthWebServiceI) {}

    @ApiEndpoint({
        summary: 'Registrar usuario',
        description: 'Registra un nuevo usuario en la plataforma',
        status: HttpStatus.CREATED,
        body: RegisterReq,
    })
    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() request: RegisterReq): Promise<void> {
        return await this.authWebService.register(request);
    }

    @ApiEndpoint({
        summary: 'Registrar empleado',
        description:
            'Registra un nuevo empleado en la plataforma (solo Owners pueden hacerlo)',
        status: HttpStatus.CREATED,
        body: RegisterEmployeeBody,
        isAuth: true,
    })
    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Post('/employee/register')
    @HttpCode(HttpStatus.CREATED)
    async registerEmployee(
        @Body() body: RegisterEmployeeBody,
        @AuthUser() authUser: User,
    ): Promise<void> {
        return await this.authWebService.registerEmployee(
            AuthMapper.registerEmployee().toRequest(body, authUser),
        );
    }

    @ApiEndpoint({
        summary: 'Aceptar solicitud de propietario',
        description:
            'Acepta la solicitud de un usuario para convertirse en propietario y le envía un token de verificación',
        type: AcceptOwnerRequestReq,
        isAuth: true,
        body: AcceptOwnerRequestBody,
    })
    @Patch('/accept/owner')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async acceptOwnerRequest(
        @Body() body: AcceptOwnerRequestBody,
        @AuthUser() authUser: User,
    ): Promise<void> {
        return await this.authWebService.acceptOwnerRequest(
            AuthMapper.acceptOwnerRequest().toRequest(authUser, body),
        );
    }
}
