export class VehicleType {
    public id: string;
    public name: string;
    public description: string;

    constructor(init?: Partial<VehicleType>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): VehicleType | null {
        if (!object) return null;
        const vehicleType = new VehicleType();
        vehicleType.id = object.id;
        vehicleType.name = object.name;
        vehicleType.description = object.description;
        return vehicleType;
    }
}
