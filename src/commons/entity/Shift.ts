import { ShiftStatus } from '../const/ShiftStatus';
import { User } from './User';

export class Shift {
    public constructor(
        public id: string,
        public startTime: Date,
        public endTime: Date,
        public initialCash: number,
        public status: ShiftStatus,
        public user?: User,
    ) {}

    static fromObject(object: { [key: string]: any }): Shift {
        return new Shift(
            object.id,
            object.startTime,
            object.endTime,
            object.initialCash,
            object.status,
            object.user ? User.fromObject(object.user) : undefined,
        );
    }

    public closeShift(endTime: Date): void {}
}
