import { User } from 'src/commons';
import { DeleteReq } from '../../request/delete.request.dto';
import { ManualValidator } from 'src/commons';

export class DeleteMapper {
    public toRequest(
        id: string,
        user: User,
        body: Record<string, any>,
    ): DeleteReq {
        const request = new DeleteReq({
            id: id,
            user: user,
            password: body['password'],
        });

        ManualValidator.validate(request);

        return request;
    }
}
