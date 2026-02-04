import { VehicleType } from './VehicleType';

export class Vehicle {
    public licensePlate: string;
    public brand: string;
    public model: string;
    public registrationDate: Date;
    public type: VehicleType | null;

    constructor(init?: Partial<Vehicle>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): Vehicle | null {
        if (!object) return null;
        const vehicle = new Vehicle();
        vehicle.licensePlate = object.licensePlate;
        vehicle.brand = object.brand;
        vehicle.model = object.model;
        vehicle.registrationDate = object.registrationDate;
        vehicle.type = VehicleType.fromObject(object.type);
        return vehicle;
    }
}
