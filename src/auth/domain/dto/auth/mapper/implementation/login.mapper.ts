import { Token } from 'src/commons';
import { LoginRes } from '../../response/login.response.dto';

export class LoginMapper {
    public toResponse(token: Token): LoginRes {
        const response = new LoginRes({
            token: token,
        });

        return response;
    }
}
