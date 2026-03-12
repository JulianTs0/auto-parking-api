import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { Errors, ServiceError } from 'src/commons';
import { AuthHelper } from '../helpers/auth.helper';

@Injectable()
export class SoftAuthGuard implements CanActivate {
    constructor(private readonly authHelper: AuthHelper) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader: string | null =
            request.headers['authorization'];

        if (!authHeader) {
            throw new ServiceError(Errors.UNAUTHORIZED);
        }

        const token: string | null =
            await this.authHelper.parseToken(authHeader);

        if (token == null) {
            throw new ServiceError(Errors.UNAUTHORIZED);
        }

        return true;
    }
}
