import { ParkingSpot } from './ParkingSpot';
import { Shift } from './Shift';
import { PricingRule } from './PricingRule';

export class ParkingLot {
    public constructor(
        public id: string,
        public name: string,
        public address: string,
        public gracePeriodMinutes: number,
        public spots?: ParkingSpot[],
        public shifts?: Shift[],
        public pricingRules?: PricingRule[],
    ) {}

    static fromObject(object: { [key: string]: any }): ParkingLot | null {
        if (!object) return null;
        return new ParkingLot(
            object.id,
            object.name,
            object.address,
            object.gracePeriodMinutes,
            object.spots
                ?.map((s: any) => ParkingSpot.fromObject(s))
                .filter((s): s is ParkingSpot => s !== null),
            object.shifts
                ?.map((s: any) => Shift.fromObject(s))
                .filter((s): s is Shift => s !== null),
            object.pricingRules
                ?.map((p: any) => PricingRule.fromObject(p))
                .filter((p): p is PricingRule => p !== null),
        );
    }

    public getAvailableSpots(): number {
        return 0;
    }
}
