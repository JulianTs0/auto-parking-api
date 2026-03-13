import { LogStatus } from '../const/log-status.enum';

export class StatusLog {
    public id: string;
    public startTime: Date;
    public endTime: Date;
    public status: LogStatus;
    public reason: string;

    constructor(init?: Partial<StatusLog>) {
        Object.assign(this, init);
    }

    static fromObject(object: {
        [key: string]: any;
    }): StatusLog | null {
        if (!object) return null;
        const statusLog = new StatusLog();
        statusLog.id = object.id;
        statusLog.startTime = object.startTime;
        statusLog.endTime = object.endTime;
        statusLog.status = object.status;
        statusLog.reason = object.reason;
        return statusLog;
    }
}
