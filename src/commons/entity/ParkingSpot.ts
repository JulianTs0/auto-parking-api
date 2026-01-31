import { SpotStatus } from '../const/SpotStatus';
import { ParkingSpotType } from './ParkingSpotType';

export class ParkingSpot {
    public constructor(
        public id: string,
        public status: SpotStatus,
        public type?: ParkingSpotType | null,
    ) {}

    static fromObject(object: {
        [key: string]: any;
    }): ParkingSpot | null {
        if (!object) return null;
        return new ParkingSpot(
            object.id,
            object.status,
            ParkingSpotType.fromObject(object.type),
        );
    }

    public register(): void {}
    public occupy(): void {}
    public release(): void {}
    public enableMaintenance(): void {}
    public disableMaintenance(): void {}
}
