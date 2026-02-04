import { User } from 'src/commons';
import { GetByIdRes } from '../../response/GetByIdRes';

export class GetByIdMapper {
    public toResponse(user: User): GetByIdRes {
        const response = new GetByIdRes();
        response.id = user.id;
        response.fullName = user.fullName;
        response.email = user.email;
        response.phoneNumber = user.phoneNumber;
        response.status = user.status;
        response.roles = [...user.roles];

        return response;
    }
}
