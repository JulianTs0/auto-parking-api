import {
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import { User } from '../entity/user.entity';

export const AuthUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        const user: User = request.user;
        return user;
    },
);
