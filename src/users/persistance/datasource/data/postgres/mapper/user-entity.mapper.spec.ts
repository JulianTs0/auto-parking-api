import { User } from 'src/commons';
import { Role } from 'src/commons/const/role.enum';
import { UserStatus } from 'src/commons/const/user-status.enum';
import { UserEntityMapper } from './user-entity.mapper';
import { UserModel } from '../models/user.model';

describe('UserEntityMapper', () => {
    describe('toDomain', () => {
        it('should return null when model is null', () => {
            expect(UserEntityMapper.toDomain(null)).toBeNull();
        });

        it('should map model properties to entity properties correctly', () => {
            const date = new Date();
            const model: UserModel = {
                id: 'uuid-123',
                fullName: 'Test User',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
                status: UserStatus.ACTIVE,
                roles: [Role.CLIENT, Role.OWNER],
                phoneNumber: '+123456789',
                createdAt: date,
                updatedAt: date,
            } as UserModel;

            const entity = UserEntityMapper.toDomain(model);

            expect(entity).toBeInstanceOf(User);
            expect(entity?.id).toBe(model.id);
            expect(entity?.fullName).toBe(model.fullName);
            expect(entity?.email).toBe(model.email);
            expect(entity?.passwordHash).toBe(model.passwordHash);
            expect(entity?.status).toBe(model.status);
            expect(entity?.phoneNumber).toBe(model.phoneNumber);
            expect(entity?.createdAt).toBe(model.createdAt);
            expect(entity?.updatedAt).toBe(model.updatedAt);

            // Assert roles are transformed to Set
            expect(entity?.roles).toBeInstanceOf(Set);
            expect(entity?.roles.size).toBe(2);
            expect(entity?.roles.has(Role.CLIENT)).toBe(true);
            expect(entity?.roles.has(Role.OWNER)).toBe(true);

            // Assert arrays are initialized empty
            expect(entity?.subscriptions).toEqual([]);
            expect(entity?.vehicles).toEqual([]);
            expect(entity?.paymentMethods).toEqual([]);
            expect(entity?.parkingLots).toEqual([]);
        });
    });

    describe('toModel', () => {
        it('should return null when entity is null', () => {
            expect(UserEntityMapper.toModel(null)).toBeNull();
        });

        it('should map entity properties to model properties correctly', () => {
            const date = new Date();
            const entity = new User({
                id: 'uuid-456',
                fullName: 'Another User',
                email: 'another@example.com',
                passwordHash: 'another-hash',
                status: UserStatus.INACTIVE,
                roles: new Set([Role.ADMIN]),
                phoneNumber: null,
                createdAt: date,
                updatedAt: date,
            });

            const model = UserEntityMapper.toModel(entity);

            expect(model).toBeInstanceOf(UserModel);
            expect(model?.id).toBe(entity.id);
            expect(model?.fullName).toBe(entity.fullName);
            expect(model?.email).toBe(entity.email);
            expect(model?.passwordHash).toBe(entity.passwordHash);
            expect(model?.status).toBe(entity.status);
            expect(model?.phoneNumber).toBeNull();
            expect(model?.createdAt).toBe(entity.createdAt);
            expect(model?.updatedAt).toBe(entity.updatedAt);

            // Assert roles Set is transformed to array
            expect(Array.isArray(model?.roles)).toBe(true);
            expect(model?.roles).toHaveLength(1);
            expect(model?.roles).toContain(Role.ADMIN);
        });
    });

    describe('toDomainList', () => {
        it('should return empty array when input is null or empty', () => {
            expect(
                UserEntityMapper.toDomainList(null as any),
            ).toEqual([]);
            expect(UserEntityMapper.toDomainList([])).toEqual([]);
        });

        it('should map an array of models to an array of entities', () => {
            const models: UserModel[] = [
                { id: '1', roles: [Role.CLIENT] } as UserModel,
                { id: '2', roles: [Role.OWNER] } as UserModel,
            ];

            const entities = UserEntityMapper.toDomainList(models);

            expect(entities).toHaveLength(2);
            expect(entities[0].id).toBe('1');
            expect(entities[0].roles.has(Role.CLIENT)).toBe(true);
            expect(entities[1].id).toBe('2');
            expect(entities[1].roles.has(Role.OWNER)).toBe(true);
        });
    });

    describe('toModelList', () => {
        it('should return empty array when input is null or empty', () => {
            expect(UserEntityMapper.toModelList(null as any)).toEqual(
                [],
            );
            expect(UserEntityMapper.toModelList([])).toEqual([]);
        });

        it('should map an array of entities to an array of models', () => {
            const entities: User[] = [
                new User({ id: '1', roles: new Set([Role.CLIENT]) }),
                new User({ id: '2', roles: new Set([Role.OWNER]) }),
            ];

            const models = UserEntityMapper.toModelList(entities);

            expect(models).toHaveLength(2);
            expect(models[0].id).toBe('1');
            expect(models[0].roles).toContain(Role.CLIENT);
            expect(models[1].id).toBe('2');
            expect(models[1].roles).toContain(Role.OWNER);
        });
    });
});
