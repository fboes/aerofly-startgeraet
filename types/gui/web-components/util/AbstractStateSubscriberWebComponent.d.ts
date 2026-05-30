import type { AppState } from "../../renderer/AppState.js";
export declare abstract class AbstractStateSubscriberWebComponent extends HTMLElement {
    protected offStateUpdate: (() => void) | null;
    protected subscribeToStateUpdates(callback: (state: AppState) => void): void;
    protected disconnectedCallback(): void;
}
//# sourceMappingURL=AbstractStateSubscriberWebComponent.d.ts.map
