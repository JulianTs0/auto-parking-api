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
        it('debería delegar la llamada a EventEmitter2.emit con los parámetros correctos', () => {
            // Arrange

            const eventName = 'module.specification.action';
            const payload = {
                actor: {},
                text: '',
                data: {},
            };

            // Act
            publisher.emit(eventName, payload);

            // Assert
            expect(eventEmitterMock.emit).toHaveBeenCalledTimes(1);
            expect(eventEmitterMock.emit).toHaveBeenCalledWith(
                eventName,
                payload,
            );
        });
    });
});
