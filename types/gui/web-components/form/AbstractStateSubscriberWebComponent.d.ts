import type { AppState } from "../../renderer/AppState.js";
export declare abstract class AbstractStateSubscriberWebComponent extends HTMLElement {
    private _offStateUpdate;
    protected subscribeToStateUpdates(callback: (state: AppState) => void): void;
    protected disconnectedCallback(): void;
}
//# sourceMappingURL=AbstractStateSubscriberWebComponent.d.ts.map
