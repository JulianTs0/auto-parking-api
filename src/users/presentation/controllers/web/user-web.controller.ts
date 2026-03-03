import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User, AuthUser, ApiEndpoint } from 'src/commons';
import { GetOwnerRequestQuery } from '../../../domain/dto/users/request/get-owner-request.query';
import { GetOwnerRequestRes } from '../../../domain/dto/users/response/get-owner-request.response.dto';
import { UserMapper } from '../../../domain/dto/users/mapper/user.mapper';
import { UserWebServiceI } from '../../../domain/services/web/user-web-service.interface';
import { AuthGuard } from 'src/auth';

@ApiTags('users/web')
@Controller('web/users')
export class UserWebController {
    constructor(private readonly userWebService: UserWebServiceI) {}

    @ApiEndpoint({
        summary: 'Obtener solicitudes de propietario',
        description:
            'Obtiene la lista de usuarios que han solicitado ser propietarios',
        type: GetOwnerRequestRes,
        isAuth: true,
        queryParams: [
            {
                name: 'page',
                description: 'Número de página (mínimo 1)',
                required: true,
                type: Number,
            },
            {
                name: 'size',
                description:
                    'Cantidad de elementos por página (mínimo 1, máximo 25)',
                required: true,
                type: Number,
            },
        ],
    })
    @Get('owner/requests')
    @UseGuards(AuthGuard)
    public async getOwnerRequest(
        @Query() query: GetOwnerRequestQuery,
        @AuthUser() authUser: User,
    ): Promise<GetOwnerRequestRes> {
        return await this.userWebService.getOwnerRequests(
            UserMapper.getOwnerRequest().toRequest(query, authUser),
        );
    }
}
