import { LoginMapper } from './implementation/login.mapper';

export class AuthMapper {
    public static auth(): AuthMapper {
        return new AuthMapper();
    }

    public static login(): LoginMapper {
        return new LoginMapper();
    }
}
