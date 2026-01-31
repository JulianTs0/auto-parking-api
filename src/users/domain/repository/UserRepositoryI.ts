import { User } from 'src/commons';

export abstract class UserRepositoryI {
    abstract findById(id: string): Promise<User | null>;
    abstract findAll(): Promise<User[]>;
    abstract save(user: User): Promise<User>;
    abstract update(user: User): Promise<User>;
    abstract delete(id: string): Promise<boolean>;
}
