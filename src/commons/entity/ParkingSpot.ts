import { SpotStatus } from '../const/SpotStatus';
import { ParkingSpotType } from './ParkingSpotType';

export class ParkingSpot {
    public constructor(
        public id: string,
        public status: SpotStatus,
        public type?: ParkingSpotType,
    ) {}

    static fromObject(object: { [key: string]: any }): ParkingSpot {
        return new ParkingSpot(
            object.id,
            object.status,
            object.type ? ParkingSpotType.fromObject(object.type) : undefined,
        );
    }

    public register(): void {}
    public occupy(): void {}
    public release(): void {}
    public enableMaintenance(): void {}
    public disableMaintenance(): void {}
}
