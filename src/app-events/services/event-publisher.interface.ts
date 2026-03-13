export abstract class EventPublisherI {
    abstract emit<T>(
        eventName: string,
        payload: T,
    ): void | Promise<void>;
}
