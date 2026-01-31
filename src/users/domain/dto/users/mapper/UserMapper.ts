import { EditMapper } from './implementation/EditMapper';
import { GetByIdMapper } from './implementation/GetByIdMapper';

export class UserMapper {
    public static getById(): GetByIdMapper {
        return new GetByIdMapper();
    }

    public static edit(): EditMapper {
        return new EditMapper();
    }
}
