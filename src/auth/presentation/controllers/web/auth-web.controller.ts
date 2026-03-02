import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User, ApiEndpoint, AuthUser } from 'src/commons';
import { AuthWebServiceI } from 'src/auth/domain/services/web/auth-web-service.interface';
import { RegisterReq } from 'src/auth/domain/dto/auth/request/register.request.dto';
import { AuthGuard } from 'src/auth/config/guards/auth.guard';
import { AcceptOwnerRequestBody } from 'src/auth/domain/dto/auth/request/accept-owner-request.body.dto';
import { AuthMapper } from 'src/auth/domain/dto/auth/mapper/auth.mapper';

@ApiTags('auth/web')
@Controller('web/auth')
export class AuthWebController {
    constructor(private readonly authWebService: AuthWebServiceI) { }

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

    @Patch('/accept/owner')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async acceptOwnerRequest(
        @Body() body: AcceptOwnerRequestBody,
        @AuthUser() authUser: User,
    ): Promise<void> {
        return await this.authWebService.acceptOwnerRequest(
            AuthMapper.acceptOwnerRequest().toRequest(authUser, body),
        );
    }
}
