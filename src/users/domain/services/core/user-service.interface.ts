import { DeleteReq } from '../../dto/users/request/delete.request.dto';
import { EditReq } from '../../dto/users/request/edit.request.dto';
import { EditRes } from '../../dto/users/response/edit.response.dto';
import { GetByIdReq } from '../../dto/users/request/get-by-id.request.dto';
import { GetByIdRes } from '../../dto/users/response/get-by-id.response.dto';
import { User } from 'src/commons';

export abstract class UserServiceI {
    abstract getById(request: GetByIdReq): Promise<GetByIdRes>;
    abstract delete(request: DeleteReq): Promise<void>;
    abstract edit(request: EditReq): Promise<EditRes>;

    abstract findUserById(id: string): Promise<User | null>;
    abstract findUserByEmail(email: string): Promise<User | null>;
    abstract existsUserByEmail(email: string): Promise<boolean>;
    abstract saveUser(user: User): Promise<User>;
    abstract updateUser(user: User): Promise<User>;
}
