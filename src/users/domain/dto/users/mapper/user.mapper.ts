import { DeleteMapper } from './implementation/delete.mapper';
import { EditMapper } from './implementation/edit.mapper';
import { GetByIdMapper } from './implementation/get-by-id.mapper';
import { GetOwnerRequestMapper } from './implementation/get-owner-request.mapper';

export class UserMapper {
    public static getById(): GetByIdMapper {
        return new GetByIdMapper();
    }

    public static edit(): EditMapper {
        return new EditMapper();
    }

    public static delete(): DeleteMapper {
        return new DeleteMapper();
    }

    public static getOwnerRequest(): GetOwnerRequestMapper {
        return new GetOwnerRequestMapper();
    }
}
