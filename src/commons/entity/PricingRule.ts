import { ParkingSpotType } from './ParkingSpotType';
import { VehicleType } from './VehicleType';

export class PricingRule {
    public constructor(
        public id: string,
        public name: string,
        public unitPrice: number,
        public unitTime: number,
        public parkingSpotType?: ParkingSpotType,
        public vehicleType?: VehicleType,
    ) {}

    static fromObject(object: { [key: string]: any }): PricingRule {
        return new PricingRule(
            object.id,
            object.name,
            object.unitPrice,
            object.unitTime,
            object.parkingSpotType
                ? ParkingSpotType.fromObject(object.parkingSpotType)
                : undefined,
            object.vehicleType
                ? VehicleType.fromObject(object.vehicleType)
                : undefined,
        );
    }

    public calculateCost(duration: number): number {
        return 0;
    }
}
