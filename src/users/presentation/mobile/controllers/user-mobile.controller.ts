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
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/commons';
import { AuthUser } from 'src/commons/decorators/auth-user.decorator';
import { AuthGuard } from 'src/auth/config';
import {
    DeleteReq,
    EditReq,
    EditRes,
    GetByIdReq,
    GetByIdRes,
    UserMapper,
    UserMobileServiceI,
    UserServiceI,
} from 'src/users/domain';
import { ApiEndpoint } from 'src/commons/decorators/api-endpoint.decorator';

@ApiTags('users/mobile')
@Controller('mobile/users')
export class UserMobileController {
    constructor(
        private readonly userCoreService: UserServiceI,
        private readonly userMobileService: UserMobileServiceI,
    ) {}

    @ApiEndpoint({
        summary: 'Obtener usuario por ID',
        description: 'Obtiene los detalles de un usuario específico',
        type: GetByIdRes,
        isAuth: true,
    })
    @UseGuards(AuthGuard)
    @Get(':id')
    public async getById(
        @Param() request: GetByIdReq,
    ): Promise<GetByIdRes> {
        return await this.userCoreService.getById(request);
    }

    @ApiEndpoint({
        summary: 'Editar usuario',
        description: 'Actualiza la información de un usuario',
        type: EditRes,
        body: EditReq,
        isAuth: true,
    })
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

    @ApiEndpoint({
        summary: 'Eliminar usuario',
        description: 'Elimina un usuario del sistema',
        status: HttpStatus.NO_CONTENT,
        body: DeleteReq,
        isAuth: true,
    })
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
