import type { AppState } from "../../renderer/AppState.js";

export abstract class AbstractStateSubscriberWebComponent extends HTMLElement {
    private _offStateUpdate: (() => void) | null = null;

    protected subscribeToStateUpdates(callback: (state: AppState) => void) {
        this._offStateUpdate?.();
        this._offStateUpdate = window.electronAPI.onStateUpdate(callback);
    }

    protected disconnectedCallback() {
        this._offStateUpdate?.();
    }
}
