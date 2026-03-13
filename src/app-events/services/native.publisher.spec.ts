import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NativeEventPublisher } from './native.publisher';

describe('NativeEventPublisher', () => {
    let publisher: NativeEventPublisher;
    let eventEmitterMock: jest.Mocked<EventEmitter2>;

    beforeEach(async () => {
        const eventEmitterTemplateMock = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NativeEventPublisher,
                {
                    provide: EventEmitter2,
                    useValue: eventEmitterTemplateMock,
                },
            ],
        }).compile();

        publisher = module.get<NativeEventPublisher>(
            NativeEventPublisher,
        );

        eventEmitterMock = module.get(EventEmitter2);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(publisher).toBeDefined();
    });

    describe('emit()', () => {
        it('should delegate call to EventEmitter2.emit with correct parameters', () => {
            // Arrange
            const eventName = 'module.specification.action';
            const payload = {
                actor: {},
                text: '',
                data: {},
            };

            // Act
            publisher.emit(eventName, payload);

            // Assert - emit should be called once
            expect(eventEmitterMock.emit).toHaveBeenCalledTimes(1);
            // Assert - emit should be called with correct params
            expect(eventEmitterMock.emit).toHaveBeenCalledWith(
                eventName,
                payload,
            );
        });
    });
});
