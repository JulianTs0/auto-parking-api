import {
    applyDecorators,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';

export interface ApiEndpointParams {
    summary: string;
    description?: string;
    type?: any;
    status?: HttpStatus;
    isAuth?: boolean;
    body?: any;
}

export function ApiEndpoint(params: ApiEndpointParams) {
    const {
        summary,
        description,
        type,
        status = HttpStatus.OK,
        isAuth = false,
        body,
    } = params;

    const decorators = [
        ApiOperation({ summary, description }),
        ApiResponse({
            status: status,
            description: 'Operación exitosa',
            type: type,
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description:
                'Datos de entrada inválidos (Error de validación)',
        }),
        ApiResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            description: 'Error interno del servidor',
        }),
        HttpCode(status),
    ];

    if (isAuth) {
        decorators.push(
            ApiBearerAuth(),
            ApiResponse({
                status: HttpStatus.UNAUTHORIZED,
                description:
                    'No autorizado - Token faltante o inválido',
            }),
            ApiResponse({
                status: HttpStatus.FORBIDDEN,
                description: 'Prohibido - No tienes permisos',
            }),
        );
    }

    if (body) {
        decorators.push(ApiBody({ type: body }));
    }

    return applyDecorators(...decorators);
}
