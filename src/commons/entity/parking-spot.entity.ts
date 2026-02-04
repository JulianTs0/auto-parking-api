import { SpotStatus } from '../const/spot-status.enum';
import { ParkingSpotType } from './parking-spot-type.entity';

export class ParkingSpot {
    public id: string;
    public status: SpotStatus;
    public type: ParkingSpotType | null;

    constructor(init?: Partial<ParkingSpot>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): ParkingSpot | null {
        if (!object) return null;
        const parkingSpot = new ParkingSpot();
        parkingSpot.id = object.id;
        parkingSpot.status = object.status;
        parkingSpot.type = ParkingSpotType.fromObject(object.type);
        return parkingSpot;
    }

    public register(): void {}
    public occupy(): void {}
    public release(): void {}
    public enableMaintenance(): void {}
    public disableMaintenance(): void {}
}
