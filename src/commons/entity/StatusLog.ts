import { LogStatus } from '../const/LogStatus';

export class StatusLog {
    public constructor(
        public id: string,
        public startTime: Date,
        public endTime: Date,
        public status: LogStatus,
        public reason: string,
    ) {}

    static fromObject(object: { [key: string]: any }): StatusLog {
        return new StatusLog(
            object.id,
            object.startTime,
            object.endTime,
            object.status,
            object.reason,
        );
    }
}
