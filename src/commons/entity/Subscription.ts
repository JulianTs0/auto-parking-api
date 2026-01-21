import { SubscriptionStatus } from '../const/SubscriptionStatus';
import { MembershipPlan } from './MembershipPlan';

export class Subscription {
    public constructor(
        public id: string,
        public startDate: Date,
        public endDate: Date,
        public status: SubscriptionStatus,
        public membershipPlan?: MembershipPlan,
    ) {}

    static fromObject(object: { [key: string]: any }): Subscription {
        return new Subscription(
            object.id,
            object.startDate,
            object.endDate,
            object.status,
            object.membershipPlan
                ? MembershipPlan.fromObject(object.membershipPlan)
                : undefined,
        );
    }

    public renew(): void {}
    public expire(): void {}
    public cancel(): void {}
    public isValid(): boolean {
        return false;
    }
}
