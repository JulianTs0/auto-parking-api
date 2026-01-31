import { VehicleType } from './VehicleType';

export class MembershipPlan {
    public constructor(
        public id: string,
        public name: string,
        public price: number,
        public vehicleType?: VehicleType | null,
    ) {}

    static fromObject(object: {
        [key: string]: any;
    }): MembershipPlan | null {
        if (!object) return null;
        return new MembershipPlan(
            object.id,
            object.name,
            object.price,
            VehicleType.fromObject(object.vehicleType),
        );
    }
}
