export class ParkingSpotType {
    public constructor(
        public id: string,
        public name: string,
        public description: string,
    ) {}

    static fromObject(object: { [key: string]: any }): ParkingSpotType {
        return new ParkingSpotType(object.id, object.name, object.description);
    }
}
