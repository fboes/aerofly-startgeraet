import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export type VisibilityWebComponentState = {
    visibilityMeters: number;
};
export declare class VisibilityWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        visibilitySm: HTMLInputElement;
        visibilityMeters: HTMLInputElement;
    };
    constructor();
    get state(): VisibilityWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    protected setMetersFromSm(): void;
    protected setSmFromMeters(): void;
    static registerElement(): void;
}
//# sourceMappingURL=VisibilityWebComponent.d.ts.map
