import { User } from 'src/commons';
import { GetByIdRes } from '../../response/get-by-id.response.dto';

export class GetByIdMapper {
    public toResponse(user: User): GetByIdRes {
        const response = new GetByIdRes({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            roles: [...user.roles],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });

        return response;
    }
}
