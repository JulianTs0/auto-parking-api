import { User } from '../../../../../../commons';
import { EditBody } from '../../request/edit.body.dto';
import { EditRes } from '../../response/edit.response.dto';
import { EditReq } from '../../request/edit.request.dto';

export class EditMapper {
    public toRequest(
        id: string,
        body: EditBody,
        authUser: User,
    ): EditReq {
        const request = new EditReq({
            id: id,
            body: body,
            authUser: authUser,
        });

        return request;
    }

    public toResponse(user: User): EditRes {
        const response = new EditRes({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            roles: [...user.roles],
            createdAt: user.createdAt,
            updateAt: user.updateAt,
        });

        return response;
    }
}
