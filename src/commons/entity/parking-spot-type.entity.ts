export class ParkingSpotType {
    public id: string;
    public name: string;
    public description: string;

    constructor(init?: Partial<ParkingSpotType>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): ParkingSpotType | null {
        if (!object) return null;
        const parkingSpotType = new ParkingSpotType();
        parkingSpotType.id = object.id;
        parkingSpotType.name = object.name;
        parkingSpotType.description = object.description;
        return parkingSpotType;
    }
}
