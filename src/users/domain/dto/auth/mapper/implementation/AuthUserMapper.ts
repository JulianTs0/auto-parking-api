import { User } from 'src/commons';
import { AuthRes } from '../../response/AuthRes';

export class AuthUserMapper {
    public toResponse(user: User): AuthRes {
        const response = new AuthRes();
        response.id = user.id;
        response.fullName = user.fullName;
        response.email = user.email;
        response.phoneNumber = user.phoneNumber;
        response.status = user.status;
        response.roles = [...user.roles];

        return response;
    }
}
