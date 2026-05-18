export declare class VisibilityWebComponent extends HTMLElement {
    elements: {
        visibilitySm: HTMLInputElement;
        visibilityMeters: HTMLInputElement;
    };
    constructor();
    connectedCallback(): void;
    protected setMetersFromSm(): void;
    protected setSmFromMeters(): void;
    static registerElement(): void;
}
//# sourceMappingURL=VisibilityWebComponent.d.ts.map
