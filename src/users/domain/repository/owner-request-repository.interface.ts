import { OwnerRequest, PageContent } from 'src/commons';
import { OwnerRequestLoadProfile } from '../../persistance/datasource/data/postgres/profiles/owner-request-load.profile';

export abstract class OwnerRequestRepositoryI {
    abstract save(request: OwnerRequest): Promise<OwnerRequest>;
    abstract update(request: OwnerRequest): Promise<OwnerRequest>;
    abstract findById(
        id: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null>;
    abstract findPendingByUserId(
        userId: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null>;
    abstract findByUserId(
        userId: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null>;
    abstract findRequestsPaginated(
        page: number,
        size: number,
        profile?: OwnerRequestLoadProfile,
    ): Promise<PageContent<OwnerRequest>>;
    abstract delete(id: string): Promise<boolean>;
}
