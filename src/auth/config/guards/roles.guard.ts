import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Errors, Role, ServiceError } from 'src/commons';
import { ROLES_KEY } from 'src/commons/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<
            Role[]
        >(ROLES_KEY, [context.getHandler(), context.getClass()]);

        if (!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();
        if (!requiredRoles.some((role) => user.roles.has(role))) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        return true;
    }
}
