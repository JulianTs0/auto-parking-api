import { User } from 'src/commons';
import { AuthRes } from '../../response/AuthRes';

export class AuthUserMapper {
    public toResponse(user: User): AuthRes {
        const response: AuthRes = new AuthRes(
            user.id,
            user.fullName,
            user.email,
            user.phoneNumber,
            user.status,
            [...user.roles],
        );

        return response;
    }
}
