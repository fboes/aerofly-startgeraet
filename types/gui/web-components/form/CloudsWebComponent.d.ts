import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type CloudsWebComponentState = {
    clouds: {
        baseFt: number;
        coverageEighths: number;
    }[];
};
export declare class CloudsWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    get state(): CloudsWebComponentState;
    private initialize;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    static registerElement(): void;
}
//# sourceMappingURL=CloudsWebComponent.d.ts.map