import { VehicleType } from './VehicleType';

export class Vehicle {
    public constructor(
        public licensePlate: string,
        public brand: string,
        public model: string,
        public registrationDate: Date,
        public type?: VehicleType,
    ) {}

    static fromObject(object: { [key: string]: any }): Vehicle {
        return new Vehicle(
            object.licensePlate,
            object.brand,
            object.model,
            object.registrationDate,
            object.type ? VehicleType.fromObject(object.type) : undefined,
        );
    }
}
