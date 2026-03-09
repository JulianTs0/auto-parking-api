import {
    User,
    OwnerRequest,
    ServiceError,
    Errors,
    PageContent,
} from 'src/commons';
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

    public toResponse(
        requests: PageContent<OwnerRequest>,
    ): GetOwnerRequestRes {
        const requestsResponse = requests.content.map((request) => {
            const user = request.user;

            if (!user) throw new ServiceError(Errors.INTERNAL_ERROR);

            return {
                id: request.id,
                status: request.status,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                user: {
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                },
            };
        });

        return new GetOwnerRequestRes({
            requests: requestsResponse,
            nextPage: requests.nextPage,
        });
    }
}
