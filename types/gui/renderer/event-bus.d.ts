type Handler<T = unknown> = (payload: T) => void;
declare class EventBus {
    private listeners;
    on<T>(event: string, handler: Handler<T>): () => void;
    emit<T>(event: string, payload: T): void;
}
export declare const bus: EventBus;
export {};
//# sourceMappingURL=event-bus.d.ts.map
