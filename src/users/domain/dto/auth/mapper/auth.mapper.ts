import { AuthUserMapper } from './implementation/auth-user.mapper';
import { LoginMapper } from './implementation/login.mapper';

export class AuthMapper {
    public static auth(): AuthUserMapper {
        return new AuthUserMapper();
    }

    public static login(): LoginMapper {
        return new LoginMapper();
    }
}
