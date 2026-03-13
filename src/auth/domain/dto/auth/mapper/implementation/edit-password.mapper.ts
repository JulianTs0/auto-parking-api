import { User } from 'src/commons';
import { EditPasswordBody } from '../../request/edit-password.body.dto';
import { EditPasswordReq } from '../../request/edit-password.request.dto';

export class EditPasswordMapper {
    public toRequest(
        body: EditPasswordBody,
        authUser: User,
    ): EditPasswordReq {
        const request = new EditPasswordReq({
            body: body,
            authUser: authUser,
        });

        return request;
    }
}
