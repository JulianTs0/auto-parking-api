import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { Errors, ServiceError, User } from 'src/commons';
import { AuthServiceI } from '../../domain/services/core/auth-service.interface';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthServiceI) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader: string | null =
            request.headers['authorization'];

        if (!authHeader) {
            throw new ServiceError(Errors.UNAUTHORIZED);
        }

        const user: User =
            await this.authService.validateToken(authHeader);

        request['user'] = user;

        return true;
    }
}
