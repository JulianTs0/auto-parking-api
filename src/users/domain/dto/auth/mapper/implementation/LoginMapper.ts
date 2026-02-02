import { Token } from 'src/commons/dto/Token';
import { LoginRes } from '../../response/LoginRes';

export class LoginMapper {
    public toResponse(token: string): LoginRes {
        const dto: Token = new Token(token);

        const response: LoginRes = new LoginRes(dto);

        return response;
    }
}
