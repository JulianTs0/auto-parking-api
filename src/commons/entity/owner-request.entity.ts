import { User } from './user.entity';
import { OwnerRequestStatus } from '../const/owner-request-status.enum';

export class OwnerRequest {
    public id: string;

    public user: User;

    public status: OwnerRequestStatus;

    public createdAt: Date;

    public updatedAt: Date;

    constructor(init?: Partial<OwnerRequest>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): OwnerRequest | null {
        if (!object) return null;

        const request = new OwnerRequest();
        request.id = object.id;
        request.user = object.user
            ? User.fromObject(object.user)!
            : object.userId
              ? new User({ id: object.userId })
              : new User();
        request.status = object.status;
        request.createdAt = object.createdAt;
        request.updatedAt = object.updatedAt;

        return request;
    }
}
