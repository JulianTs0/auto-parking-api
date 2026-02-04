import { Token } from 'src/commons/dto/token.dto';
import { LoginRes } from '../../response/login.response.dto';

export class LoginMapper {
    public toResponse(token: string): LoginRes {
        const dto = new Token();
        dto.accessToken = token;

        const response = new LoginRes();
        response.token = dto;

        return response;
    }
}
