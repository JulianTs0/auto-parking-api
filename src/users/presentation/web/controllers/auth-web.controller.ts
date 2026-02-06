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
import {
    AuthReq,
    AuthRes,
    AuthServiceI,
    AuthWebServiceI,
    LoginReq,
    LoginRes,
    RegisterReq,
} from 'src/users/domain';

@Controller('web/auth')
export class AuthWebController {
    constructor(
        private readonly authWebService: AuthWebServiceI,
        private readonly authCoreService: AuthServiceI,
    ) {}

    @Patch('/login')
    public async login(
        @Body() loginRequest: LoginReq,
    ): Promise<LoginRes> {
        return await this.authCoreService.login(loginRequest);
    }

    @Get('/auth')
    public async auth(@Headers() request: AuthReq): Promise<AuthRes> {
        return await this.authCoreService.auth(request);
    }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() request: RegisterReq): Promise<void> {
        return await this.authWebService.register(request);
    }
}
