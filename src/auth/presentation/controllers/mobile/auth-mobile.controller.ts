import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthMobileServiceI, RegisterReq } from 'src/auth/domain';
import { ApiEndpoint } from 'src/commons/decorators/api-endpoint.decorator';

@ApiTags('auth/mobile')
@Controller('mobile/auth')
export class AuthMobileController {
    constructor(
        private readonly authMobileService: AuthMobileServiceI,
    ) {}

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
