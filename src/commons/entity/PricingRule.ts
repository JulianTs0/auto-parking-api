import { ParkingSpotType } from './ParkingSpotType';
import { VehicleType } from './VehicleType';

export class PricingRule {
    public id: string;
    public name: string;
    public unitPrice: number;
    public unitTime: number;
    public parkingSpotType: ParkingSpotType | null;
    public vehicleType: VehicleType | null;

    constructor(init?: Partial<PricingRule>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): PricingRule | null {
        if (!object) return null;
        const pricingRule = new PricingRule();
        pricingRule.id = object.id;
        pricingRule.name = object.name;
        pricingRule.unitPrice = object.unitPrice;
        pricingRule.unitTime = object.unitTime;
        pricingRule.parkingSpotType = ParkingSpotType.fromObject(
            object.parkingSpotType,
        );
        pricingRule.vehicleType = VehicleType.fromObject(
            object.vehicleType,
        );
        return pricingRule;
    }

    public calculateCost(duration: number): number {
        return 0;
    }
}
