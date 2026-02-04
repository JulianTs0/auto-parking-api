import {
    DeleteReq,
    EditReq,
    EditRes,
    GetByIdReq,
    GetByIdRes,
} from 'src/users/domain';

export abstract class UserServiceI {
    abstract getById(request: GetByIdReq): Promise<GetByIdRes>;
    abstract delete(request: DeleteReq): Promise<void>;
    abstract edit(request: EditReq): Promise<EditRes>;
}
