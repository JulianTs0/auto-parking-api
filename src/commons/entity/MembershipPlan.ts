import { VehicleType } from './VehicleType';

export class MembershipPlan {
    public id: string;
    public name: string;
    public price: number;
    public vehicleType: VehicleType | null;

    constructor(init?: Partial<MembershipPlan>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): MembershipPlan | null {
        if (!object) return null;
        const membershipPlan = new MembershipPlan();
        membershipPlan.id = object.id;
        membershipPlan.name = object.name;
        membershipPlan.price = object.price;
        membershipPlan.vehicleType = VehicleType.fromObject(
            object.vehicleType,
        );
        return membershipPlan;
    }
}
