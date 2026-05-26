export class AbstractStateSubscriberWebComponent extends HTMLElement {
    _offStateUpdate = null;
    subscribeToStateUpdates(callback) {
        this._offStateUpdate?.();
        this._offStateUpdate = window.electronAPI.onStateUpdate(callback);
    }
    disconnectedCallback() {
        this._offStateUpdate?.();
    }
}
