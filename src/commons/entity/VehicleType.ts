export class VehicleType {
    public constructor(
        public id: string,
        public name: string,
        public description: string,
    ) {}

    static fromObject(object: { [key: string]: any }): VehicleType {
        return new VehicleType(object.id, object.name, object.description);
    }
}
