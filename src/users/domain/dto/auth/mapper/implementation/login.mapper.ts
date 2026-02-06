import { Token } from 'src/commons/dto/token.dto';
import { LoginRes } from '../../response/login.response.dto';

export class LoginMapper {
    public toResponse(token: Token): LoginRes {
        const response = new LoginRes();
        response.token = token;

        return response;
    }
}
