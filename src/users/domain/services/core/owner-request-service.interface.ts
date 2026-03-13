import { OwnerRequest, PageContent } from 'src/commons';
import { OwnerRequestLoadProfile } from '../../../persistance/datasource/data/postgres/profiles/owner-request-load.profile';

export abstract class OwnerRequestInternalServiceI {
    abstract save(request: OwnerRequest): Promise<OwnerRequest>;
    abstract update(request: OwnerRequest): Promise<OwnerRequest>;
    abstract findByUserId(
        userId: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null>;
    abstract findPendingByUserId(
        userId: string,
        profile?: OwnerRequestLoadProfile,
    ): Promise<OwnerRequest | null>;
    abstract findRequestsPaginated(
        page: number,
        size: number,
        profile?: OwnerRequestLoadProfile,
    ): Promise<PageContent<OwnerRequest>>;
}
