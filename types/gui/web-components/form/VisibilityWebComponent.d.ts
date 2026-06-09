import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type VisibilityWebComponentState = {
    visibilityMeters: number;
};
export declare class VisibilityWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    get state(): VisibilityWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    private setMetersFromSm;
    private setSmFromMeters;
    static registerElement(): void;
}
//# sourceMappingURL=VisibilityWebComponent.d.ts.map