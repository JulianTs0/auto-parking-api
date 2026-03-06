import { AcceptOwnerRequestMapper } from './implementation/accept-owner-request.mapper';
import { AuthUserMapper } from './implementation/auth-user.mapper';
import { EditPasswordMapper } from './implementation/edit-password.mapper';
import { GetOwnerRequestMapper } from './implementation/get-owner-request.mapper';
import { LoginMapper } from './implementation/login.mapper';
import { RegisterEmployeeMapper } from './implementation/register-employee.mapper';
import { RequestOwnerUpgradeMapper } from './implementation/request-owner-upgrade.mapper';
import { UpgradeToOwnerMapper } from './implementation/upgrade-to-owner.mapper';

export class AuthMapper {
    public static auth(): AuthUserMapper {
        return new AuthUserMapper();
    }

    public static login(): LoginMapper {
        return new LoginMapper();
    }

    public static acceptOwnerRequest(): AcceptOwnerRequestMapper {
        return new AcceptOwnerRequestMapper();
    }

    public static registerEmployee(): RegisterEmployeeMapper {
        return new RegisterEmployeeMapper();
    }

    public static editPassword(): EditPasswordMapper {
        return new EditPasswordMapper();
    }

    public static upgradeToOwner(): UpgradeToOwnerMapper {
        return new UpgradeToOwnerMapper();
    }

    public static requestOwnerUpgrade(): RequestOwnerUpgradeMapper {
        return new RequestOwnerUpgradeMapper();
    }

    public static getOwnerRequest(): GetOwnerRequestMapper {
        return new GetOwnerRequestMapper();
    }
}
