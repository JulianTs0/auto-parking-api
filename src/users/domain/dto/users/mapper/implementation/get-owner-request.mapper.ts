import { User, PageContent } from '../../../../../../commons';
import { GetOwnerRequestQuery } from '../../request/get-owner-request.query';
import { GetOwnerRequestReq } from '../../request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../response/get-owner-request.response.dto';

export class GetOwnerRequestMapper {
    public toRequest(
        query: GetOwnerRequestQuery,
        authUser: User,
    ): GetOwnerRequestReq {
        const request = new GetOwnerRequestReq({
            ...query,
            authUser: authUser,
        });

        return request;
    }

    public toResponse(users: PageContent<User>): GetOwnerRequestRes {
        const usersResponse = users.content.map((user) => ({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            roles: [...user.roles],
            createdAt: user.createdAt,
            updateAt: user.updateAt,
        }));

        return new GetOwnerRequestRes({
            users: usersResponse,
            nextPage: users.nextPage,
        });
    }
}
