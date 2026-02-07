import { User } from 'src/commons';
import { AuthRes } from '../../response/auth.response.dto';

export class AuthUserMapper {
    public toResponse(user: User): AuthRes {
        const response = new AuthRes({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            roles: [...user.roles],
            createdAt: user.createdAt,
            updateAt: user.updateAt,
        });

        return response;
    }
}
