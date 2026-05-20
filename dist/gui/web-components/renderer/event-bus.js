class EventBus {
    listeners = new Map();
    on(event, handler) {
        if (!this.listeners.has(event))
            this.listeners.set(event, new Set());
        this.listeners.get(event)?.add(handler);
        return () => this.listeners.get(event)?.delete(handler);
    }
    emit(event, payload) {
        this.listeners.get(event)?.forEach((h) => h(payload));
    }
}
export const bus = new EventBus();
