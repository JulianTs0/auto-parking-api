import { VehicleType } from './VehicleType';

export class MembershipPlan {
    public constructor(
        public id: string,
        public name: string,
        public price: number,
        public vehicleType?: VehicleType,
    ) {}

    static fromObject(object: { [key: string]: any }): MembershipPlan {
        return new MembershipPlan(
            object.id,
            object.name,
            object.price,
            object.vehicleType
                ? VehicleType.fromObject(object.vehicleType)
                : undefined,
        );
    }
}
