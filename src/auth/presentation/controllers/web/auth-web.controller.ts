import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthWebServiceI, RegisterReq } from 'src/auth/domain';
import { ApiEndpoint } from 'src/commons/decorators/api-endpoint.decorator';

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
}
