import { User } from 'src/commons';
import { GetByIdRes } from '../../response/GetByIdRes';

export class EditMapper {
    public toResponse(user: User): GetByIdRes {
        const response: GetByIdRes = new GetByIdRes(
            user.id,
            user.fullName,
            user.email,
            user.phoneNumber,
            user.status,
            [...user.roles],
        );

        return response;
    }
}
