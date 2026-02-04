import { SubscriptionStatus } from '../const/SubscriptionStatus';
import { MembershipPlan } from './MembershipPlan';

export class Subscription {
    public id: string;
    public startDate: Date;
    public endDate: Date;
    public status: SubscriptionStatus;
    public membershipPlan: MembershipPlan | null;

    constructor(init?: Partial<Subscription>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): Subscription | null {
        if (!object) return null;
        const subscription = new Subscription();
        subscription.id = object.id;
        subscription.startDate = object.startDate;
        subscription.endDate = object.endDate;
        subscription.status = object.status;
        subscription.membershipPlan = MembershipPlan.fromObject(
            object.membershipPlan,
        );
        return subscription;
    }

    public renew(): void {}
    public expire(): void {}
    public cancel(): void {}
    public isValid(): boolean {
        return false;
    }
}
