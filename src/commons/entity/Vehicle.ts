import { VehicleType } from './VehicleType';

export class Vehicle {
    public constructor(
        public licensePlate: string,
        public brand: string,
        public model: string,
        public registrationDate: Date,
        public type?: VehicleType | null,
    ) {}

    static fromObject(object: {
        [key: string]: any;
    }): Vehicle | null {
        if (!object) return null;
        return new Vehicle(
            object.licensePlate,
            object.brand,
            object.model,
            object.registrationDate,
            VehicleType.fromObject(object.type),
        );
    }
}
