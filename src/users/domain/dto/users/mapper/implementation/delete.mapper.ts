import { User } from '../../../../../../commons';
import { DeleteBody } from '../../request/delete.body.dto';
import { DeleteReq } from '../../request/delete.request.dto';

export class DeleteMapper {
    public toRequest(
        id: string,
        body: DeleteBody,
        authUser: User,
    ): DeleteReq {
        const request = new DeleteReq({
            id: id,
            body: body,
            authUser: authUser,
        });

        return request;
    }
}
