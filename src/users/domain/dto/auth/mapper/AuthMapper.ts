import { LoginMapper } from './implementation/LoginMapper';

export class AuthMapper {
    public static auth(): AuthMapper {
        return new AuthMapper();
    }

    public static login(): LoginMapper {
        return new LoginMapper();
    }
}
