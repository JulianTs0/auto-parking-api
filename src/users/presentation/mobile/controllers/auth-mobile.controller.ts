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
    AuthMobileServiceI,
    AuthReq,
    AuthRes,
    AuthServiceI,
    LoginReq,
    LoginRes,
    RegisterReq,
} from 'src/users/domain';

@Controller('mobile/auth')
export class AuthMobileController {
    constructor(
        private readonly authMobileService: AuthMobileServiceI,
        private readonly authCoreService: AuthServiceI,
    ) { }

    @Patch('/login')
    public async login(
        @Body() loginRequest: LoginReq,
    ): Promise<LoginRes> {
        return await this.authCoreService.login(loginRequest);
    }

    @Get()
    public async auth(@Headers() request: AuthReq): Promise<AuthRes> {
        return await this.authCoreService.auth(request);
    }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() request: RegisterReq): Promise<void> {
        return await this.authMobileService.register(request);
    }
}
