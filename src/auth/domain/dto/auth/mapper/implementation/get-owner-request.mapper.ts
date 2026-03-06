import { User, OwnerRequest, PageContent } from 'src/commons';
import { GetOwnerRequestQuery } from '../../request/get-owner-request.query';
import { GetOwnerRequestReq } from '../../request/get-owner-request.request.dto';
import {
    GetOwnerRequestRes,
    OwnerRequestItemRes,
    OwnerRequestUserData,
} from '../../response/get-owner-request.response.dto';

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

    public toResponse(
        requests: PageContent<OwnerRequest>,
    ): GetOwnerRequestRes {
        const requestsResponse = requests.content.map((request) => {
            const user = request.user;
            if (!user)
                throw new Error('User not loaded in OwnerRequest');

            const userData: OwnerRequestUserData = {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                status: user.status,
                roles: [...user.roles],
            };

            const item: OwnerRequestItemRes = {
                id: request.id,
                status: request.status,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                user: userData,
            };

            return item;
        });

        return new GetOwnerRequestRes({
            requests: requestsResponse,
            nextPage: requests.nextPage,
        });
    }
}
