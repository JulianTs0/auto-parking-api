import { User } from 'src/commons';
import { UserModel } from '../models/UserModel';

export class UserEntityMapper {
    public static toDomain(userModel: UserModel | null): User | null {
        if (userModel == null) return null;

        const entity: User = new User(
            userModel.id,
            userModel.fullName,
            userModel.email,
            userModel.phoneNumber,
            userModel.passwordHash,
            userModel.status,
            new Set(userModel.roles),
            userModel.createdAt,
            userModel.updatedAt,
            [],
            [],
            [],
            [],
        );

        return entity;
    }

    public static toModel(user: User | null): UserModel | null {
        if (user == null) return null;

        const model: UserModel = new UserModel();

        model.id = user.id;
        model.fullName = user.fullName;
        model.email = user.email;
        model.phoneNumber = user.phoneNumber;
        model.passwordHash = user.passwordHash;
        model.status = user.status;
        model.roles = [...user.roles];
        model.createdAt;
        model.updatedAt;

        return model;
    }

    public static toDomainList(userModels: UserModel[]): User[] {
        if (userModels == null) return [];

        return userModels
            .map((u) => this.toDomain(u))
            .filter((u): u is User => u != null);
    }

    public static toModelList(users: User[]): UserModel[] {
        if (users == null) return [];

        return users
            .map((u) => this.toModel(u))
            .filter((u): u is UserModel => u != null);
    }
}
