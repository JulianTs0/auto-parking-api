import { User } from 'src/commons';
import { EditRes } from '../../response/edit.response.dto';
import { EditReq } from '../../request/edit.request.dto';
import { ManualValidator } from 'src/commons';

export class EditMapper {
    public toRequest(
        id: string,
        user: User,
        body: Record<string, any>,
    ): EditReq {
        const request = new EditReq({
            id: id,
            fullName: body['fullName'],
            phoneNumber: body['phoneNumber'],
            user: user,
        });

        ManualValidator.validate(request);

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
