import { User } from 'src/commons';
import { GetByIdRes } from '../../response/get-by-id.response.dto';
import { EditRes } from '../../response/edit.response.dto';

export class EditMapper {
    public toResponse(user: User): EditRes {
        const response = new EditRes();
        response.id = user.id;
        response.fullName = user.fullName;
        response.email = user.email;
        response.phoneNumber = user.phoneNumber;
        response.status = user.status;
        response.roles = [...user.roles];

        return response;
    }
}
