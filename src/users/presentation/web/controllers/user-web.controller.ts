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
    UserServiceI,
    UserWebServiceI,
} from 'src/users/domain';

@Controller('web/users')
export class UserWebController {
    constructor(
        private readonly userCoreService: UserServiceI,
        private readonly userWebService: UserWebServiceI,
    ) {}

    @UseGuards(AuthGuard)
    @Get(':id')
    public async getById(
        @Param('id') request: GetByIdReq,
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
