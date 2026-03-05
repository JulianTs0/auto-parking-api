import { Injectable } from '@nestjs/common';
import { UserWebServiceI } from './user-web-service.interface';
import { UserRepositoryI } from '../../repository/user-repository.interface';
import { GetOwnerRequestReq } from '../../dto/users/request/get-owner-request.request.dto';
import { GetOwnerRequestRes } from '../../dto/users/response/get-owner-request.response.dto';
import { Errors, ServiceError, User, PageContent } from 'src/commons';
import { UserMapper } from '../../dto/users/mapper/user.mapper';

@Injectable()
export class UserWebService implements UserWebServiceI {
    constructor(private readonly userRepository: UserRepositoryI) {}

    public async getOwnerRequests(
        request: GetOwnerRequestReq,
    ): Promise<GetOwnerRequestRes> {
        if (!request.authUser.isAdmin()) {
            throw new ServiceError(Errors.FORBIDDEN);
        }

        const models: PageContent<User> =
            await this.userRepository.findPendingOwnersPaginated(
                request.size,
                request.page,
            );

        return UserMapper.getOwnerRequest().toResponse(models);
    }
}
