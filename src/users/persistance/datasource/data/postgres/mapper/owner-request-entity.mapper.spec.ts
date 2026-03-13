import { OwnerRequest, OwnerRequestStatus, User } from 'src/commons';
import { OwnerRequestEntityMapper } from './owner-request-entity.mapper';
import { OwnerRequestModel } from '../models/owner-request.model';
import { UserModel } from '../models/user.model';

describe('OwnerRequestEntityMapper', () => {
    describe('toDomain', () => {
        it('should return null when model is null', () => {
            expect(
                OwnerRequestEntityMapper.toDomain(null),
            ).toBeNull();
        });

        it('should map model to entity with complete user object', () => {
            const date = new Date();
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
                roles: [],
            } as unknown as UserModel;

            const model: OwnerRequestModel = {
                id: 'req-123',
                status: OwnerRequestStatus.PENDING,
                createdAt: date,
                updatedAt: date,
                user: mockUser,
                userId: 'user-123',
            } as OwnerRequestModel;

            const entity = OwnerRequestEntityMapper.toDomain(model);

            expect(entity).toBeInstanceOf(OwnerRequest);
            expect(entity?.id).toBe(model.id);
            expect(entity?.status).toBe(model.status);
            expect(entity?.createdAt).toBe(model.createdAt);
            expect(entity?.updatedAt).toBe(model.updatedAt);

            // Assert user was mapped
            expect(entity?.user).toBeInstanceOf(User);
            expect(entity?.user.id).toBe(mockUser.id);
            expect(entity?.user.email).toBe(mockUser.email);
        });

        it('should map model to entity with only userId (shallow user)', () => {
            const date = new Date();
            const model: OwnerRequestModel = {
                id: 'req-456',
                status: OwnerRequestStatus.APPROVED,
                createdAt: date,
                updatedAt: date,
                userId: 'user-456',
                user: undefined,
            } as unknown as OwnerRequestModel;

            const entity = OwnerRequestEntityMapper.toDomain(model);

            expect(entity).toBeInstanceOf(OwnerRequest);
            expect(entity?.user).toBeInstanceOf(User);
            expect(entity?.user.id).toBe(model.userId);
            expect(entity?.user.email).toBeUndefined();
        });
    });

    describe('toModel', () => {
        it('should return null when entity is null', () => {
            expect(OwnerRequestEntityMapper.toModel(null)).toBeNull();
        });

        it('should map entity to model and map full user if email is present', () => {
            const date = new Date();
            const userEntity = new User({
                id: 'user-123',
                email: 'test@test.com',
                roles: new Set(),
            });

            const entity = new OwnerRequest({
                id: 'req-123',
                status: OwnerRequestStatus.PENDING,
                createdAt: date,
                updatedAt: date,
                user: userEntity,
            });

            const model = OwnerRequestEntityMapper.toModel(entity);

            expect(model).toBeInstanceOf(OwnerRequestModel);
            expect(model?.id).toBe(entity.id);
            expect(model?.status).toBe(entity.status);
            expect(model?.userId).toBe(userEntity.id);
            expect(model?.user).toBeDefined();
            expect(model?.user?.id).toBe(userEntity.id);
            expect(model?.user?.email).toBe(userEntity.email);
        });

        it('should map entity to model with only userId if email is not present', () => {
            const date = new Date();
            const userEntity = new User({
                id: 'user-999',
            });

            const entity = new OwnerRequest({
                id: 'req-999',
                status: OwnerRequestStatus.REJECTED,
                createdAt: date,
                updatedAt: date,
                user: userEntity,
            });

            const model = OwnerRequestEntityMapper.toModel(entity);

            expect(model).toBeInstanceOf(OwnerRequestModel);
            expect(model?.id).toBe(entity.id);
            expect(model?.userId).toBe(userEntity.id);
            expect(model?.user).toBeUndefined();
        });
    });

    describe('toDomainList', () => {
        it('should return empty array when input is null or empty', () => {
            expect(
                OwnerRequestEntityMapper.toDomainList(null as any),
            ).toEqual([]);
            expect(OwnerRequestEntityMapper.toDomainList([])).toEqual(
                [],
            );
        });

        it('should map list of models to list of entities', () => {
            const models = [
                {
                    id: '1',
                    status: OwnerRequestStatus.PENDING,
                    userId: 'u1',
                } as OwnerRequestModel,
                {
                    id: '2',
                    status: OwnerRequestStatus.APPROVED,
                    userId: 'u2',
                } as OwnerRequestModel,
            ];

            const entities =
                OwnerRequestEntityMapper.toDomainList(models);
            expect(entities).toHaveLength(2);
            expect(entities[0].id).toBe('1');
            expect(entities[0].user.id).toBe('u1');
            expect(entities[1].id).toBe('2');
            expect(entities[1].user.id).toBe('u2');
        });
    });

    describe('toModelList', () => {
        it('should return empty array when input is null or empty', () => {
            expect(
                OwnerRequestEntityMapper.toModelList(null as any),
            ).toEqual([]);
            expect(OwnerRequestEntityMapper.toModelList([])).toEqual(
                [],
            );
        });

        it('should map list of entities to list of models', () => {
            const entities = [
                new OwnerRequest({
                    id: '1',
                    user: new User({ id: 'u1' }),
                }),
                new OwnerRequest({
                    id: '2',
                    user: new User({ id: 'u2' }),
                }),
            ];

            const models =
                OwnerRequestEntityMapper.toModelList(entities);
            expect(models).toHaveLength(2);
            expect(models[0].id).toBe('1');
            expect(models[0].userId).toBe('u1');
            expect(models[1].id).toBe('2');
            expect(models[1].userId).toBe('u2');
        });
    });
});
