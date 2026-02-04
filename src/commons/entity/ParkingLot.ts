import { ParkingSpot } from './ParkingSpot';
import { Shift } from './Shift';
import { PricingRule } from './PricingRule';

export class ParkingLot {
    public id: string;
    public name: string;
    public address: string;
    public gracePeriodMinutes: number;
    public spots: ParkingSpot[];
    public shifts: Shift[];
    public pricingRules: PricingRule[];

    constructor(init?: Partial<ParkingLot>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): ParkingLot | null {
        if (!object) return null;
        const parkingLot = new ParkingLot();
        parkingLot.id = object.id;
        parkingLot.name = object.name;
        parkingLot.address = object.address;
        parkingLot.gracePeriodMinutes = object.gracePeriodMinutes;
        parkingLot.spots = object.spots
            ?.map((s: any) => ParkingSpot.fromObject(s))
            .filter((s): s is ParkingSpot => s !== null) || [];
        parkingLot.shifts = object.shifts
            ?.map((s: any) => Shift.fromObject(s))
            .filter((s): s is Shift => s !== null) || [];
        parkingLot.pricingRules = object.pricingRules
            ?.map((p: any) => PricingRule.fromObject(p))
            .filter((p): p is PricingRule => p !== null) || [];
        return parkingLot;
    }

    public getAvailableSpots(): number {
        return 0;
    }
}
