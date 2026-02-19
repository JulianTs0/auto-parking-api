import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    UseGuards,
} from '@nestjs/common';
import { User } from 'src/commons';
import { AuthUser } from 'src/commons/decorators/auth-user.decorator';
import { AuthGuard } from 'src/auth/config';
import {
    EditRes,
    GetByIdReq,
    GetByIdRes,
    UserMapper,
    UserMobileServiceI,
    UserServiceI,
} from 'src/users/domain';

@Controller('mobile/users')
export class UserMobileController {
    constructor(
        private readonly userCoreService: UserServiceI,
        private readonly userMobileService: UserMobileServiceI,
    ) {}

    @UseGuards(AuthGuard)
    @Get(':id')
    public async getById(
        @Param() request: GetByIdReq,
    ): Promise<GetByIdRes> {
        return await this.userCoreService.getById(request);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    public async edit(
        @Param('id') id: string,
        @Body() body: Record<string, any>,
        @AuthUser() authUser: User,
    ): Promise<EditRes> {
        return await this.userCoreService.edit(
            UserMapper.edit().toRequest(id, authUser, body),
        );
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async delete(
        @Param('id') id: string,
        @Body() body: Record<string, any>,
        @AuthUser() authUser: User,
    ): Promise<void> {
        return await this.userCoreService.delete(
            UserMapper.delete().toRequest(id, authUser, body),
        );
    }
}
