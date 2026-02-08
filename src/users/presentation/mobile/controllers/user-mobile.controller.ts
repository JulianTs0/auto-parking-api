import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/users/config';
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
    ) { }

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
        @Request() req: any,
    ): Promise<EditRes> {
        return await this.userCoreService.edit(
            UserMapper.edit().toRequest(id, req.user, body),
        );
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async delete(
        @Param('id') id: string,
        @Body() body: Record<string, any>,
        @Request() req: any,
    ): Promise<void> {
        return await this.userCoreService.delete(
            UserMapper.delete().toRequest(id, req.user, body),
        );
    }
}
