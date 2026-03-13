import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventPublisherI } from './services/event-publisher.interface';
import { NativeEventPublisher } from './services/native.publisher';

@Global()
@Module({
    imports: [
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: '.',
        }),
    ],
    providers: [
        {
            provide: EventPublisherI,
            useClass: NativeEventPublisher,
        },
    ],
    exports: [EventPublisherI],
})
export class AppEventsModule {}
