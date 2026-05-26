import { AbstractStateSubscriberWebComponent } from "./AbstractStateSubscriberWebComponent.js";
export type CloudsWebComponentState = {
    clouds: {
        baseFt: number;
        coverageEighths: number;
    }[];
};
export declare class CloudsWebComponent extends AbstractStateSubscriberWebComponent {
    elements: {
        base: HTMLInputElement;
        coverage: HTMLSelectElement;
    }[];
    constructor();
    get state(): CloudsWebComponentState;
    connectedCallback(): void;
    handleChange(): void;
    static registerElement(): void;
}
//# sourceMappingURL=CloudsWebComponent.d.ts.map
