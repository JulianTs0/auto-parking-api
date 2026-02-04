import { Token } from 'src/commons/dto/Token';
import { LoginRes } from '../../response/LoginRes';

export class LoginMapper {
    public toResponse(token: string): LoginRes {
        const dto = new Token();
        dto.accessToken = token;

        const response = new LoginRes();
        response.token = dto;

        return response;
    }
}
