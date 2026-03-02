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
import { AuthGuard } from 'src/auth';
import { User, AuthUser, ApiEndpoint } from '../../../../commons';
import { EditBody } from '../../../domain/dto/users/request/edit.body.dto';
import { EditRes } from '../../../domain/dto/users/response/edit.response.dto';
import { GetByIdReq } from '../../../domain/dto/users/request/get-by-id.request.dto';
import { GetByIdRes } from '../../../domain/dto/users/response/get-by-id.response.dto';
import { UserMapper } from '../../../domain/dto/users/mapper/user.mapper';
import { UserServiceI } from '../../../domain/services/core/user-service.interface';
import { DeleteBody } from '../../../domain/dto/users/request/delete.body.dto';

@ApiTags('users/core')
@Controller('users')
export class UserCoreController {
    constructor(private readonly userCoreService: UserServiceI) { }

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
        body: EditBody,
        isAuth: true,
    })
    @UseGuards(AuthGuard)
    @Put(':id')
    public async edit(
        @Param('id') id: string,
        @Body() body: EditBody,
        @AuthUser() authUser: User,
    ): Promise<EditRes> {
        return await this.userCoreService.edit(
            UserMapper.edit().toRequest(id, body, authUser),
        );
    }

    @ApiEndpoint({
        summary: 'Eliminar usuario',
        description: 'Elimina un usuario del sistema',
        status: HttpStatus.NO_CONTENT,
        body: DeleteBody,
        isAuth: true,
    })
    @UseGuards(AuthGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async delete(
        @Param('id') id: string,
        @Body() body: DeleteBody,
        @AuthUser() authUser: User,
    ): Promise<void> {
        return await this.userCoreService.delete(
            UserMapper.delete().toRequest(id, body, authUser),
        );
    }
}
