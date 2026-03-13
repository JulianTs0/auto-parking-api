import { ShiftStatus } from '../const/shift-status.enum';
import { User } from './user.entity';

export class Shift {
    public id: string;
    public startTime: Date;
    public endTime: Date;
    public initialCash: number;
    public status: ShiftStatus;
    public user: User | null;

    constructor(init?: Partial<Shift>) {
        Object.assign(this, init);
    }

    static fromObject(object: { [key: string]: any }): Shift | null {
        if (!object) return null;
        const shift = new Shift();
        shift.id = object.id;
        shift.startTime = object.startTime;
        shift.endTime = object.endTime;
        shift.initialCash = object.initialCash;
        shift.status = object.status;
        shift.user = User.fromObject(object.user);
        return shift;
    }

    public closeShift(endTime: Date): void {}
}
