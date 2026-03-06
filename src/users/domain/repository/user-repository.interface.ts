import { User, PageContent } from 'src/commons';

export abstract class UserRepositoryI {
    abstract findById(id: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract existsByEmail(email: string): Promise<boolean>;
    abstract findAll(): Promise<User[]>;
    abstract save(user: User): Promise<User>;
    abstract update(user: User): Promise<User>;
    abstract delete(id: string): Promise<boolean>;
}
