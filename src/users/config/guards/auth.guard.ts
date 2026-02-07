import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { User } from 'src/commons';
import { AuthServiceI } from 'src/users/domain';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthServiceI) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const authHeader: string = request.headers['authorization'];

        const user: User =
            await this.authService.validateToken(authHeader);

        request['user'] = user;

        return true;
    }
}
