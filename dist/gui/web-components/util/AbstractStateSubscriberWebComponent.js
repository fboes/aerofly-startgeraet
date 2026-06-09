export class AbstractStateSubscriberWebComponent extends HTMLElement {
    offStateUpdate = null;
    subscribeToStateUpdates(callback) {
        this.offStateUpdate?.();
        this.offStateUpdate = window.electronAPI.onStateUpdate(callback);
    }
    disconnectedCallback() {
        this.offStateUpdate?.();
    }
}
