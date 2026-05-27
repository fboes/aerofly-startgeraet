import type { AppState } from "../../renderer/AppState.js";

export abstract class AbstractStateSubscriberWebComponent extends HTMLElement {
    protected offStateUpdate: (() => void) | null = null;

    protected subscribeToStateUpdates(callback: (state: AppState) => void) {
        this.offStateUpdate?.();
        this.offStateUpdate = window.electronAPI.onStateUpdate(callback);
    }

    protected disconnectedCallback() {
        this.offStateUpdate?.();
    }
}
