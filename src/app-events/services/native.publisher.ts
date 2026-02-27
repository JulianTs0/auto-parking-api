import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPublisherI } from './event-publisher.interface';

@Injectable()
export class NativeEventPublisher implements EventPublisherI {
    constructor(private readonly eventEmitter: EventEmitter2) { }

    public emit<T>(eventName: string, payload: T): void {
        this.eventEmitter.emit(eventName, payload);
    }
}
