type Handler<T = unknown> = (payload: T) => void;

class EventBus {
    private listeners = new Map<string, Set<Handler>>();

    on<T>(event: string, handler: Handler<T>): () => void {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event)?.add(handler as Handler);
        return () => this.listeners.get(event)?.delete(handler as Handler);
    }

    emit<T>(event: string, payload: T): void {
        this.listeners.get(event)?.forEach((h) => h(payload));
    }
}

export const bus = new EventBus();
