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

    static fromObject(object: { [key: string]: any }): ParkingLot {
        return new ParkingLot(
            object.id,
            object.name,
            object.address,
            object.gracePeriodMinutes,
            object.spots
                ? object.spots.map((s: any) => ParkingSpot.fromObject(s))
                : undefined,
            object.shifts
                ? object.shifts.map((s: any) => Shift.fromObject(s))
                : undefined,
            object.pricingRules
                ? object.pricingRules.map((p: any) => PricingRule.fromObject(p))
                : undefined,
        );
    }

    public getAvailableSpots(): number {
        return 0;
    }
}
