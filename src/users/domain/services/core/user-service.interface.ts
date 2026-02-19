import { User } from 'src/commons';
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

    // Internal Application Use
    abstract findUserById(id: string): Promise<User | null>;
    abstract findUserByEmail(email: string): Promise<User | null>;
    abstract existsUserByEmail(email: string): Promise<boolean>;
    abstract saveUser(user: User): Promise<User>;
    abstract updateUser(user: User): Promise<User>;
}
