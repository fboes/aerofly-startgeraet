import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type MetarInputWebComponentState = {
    metar: string;
};
export declare class MetarInputWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    get state(): MetarInputWebComponentState;
    intialize(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    handleChange: () => void;
    static registerElement(): void;
}
//# sourceMappingURL=MetarInputWebComponent.d.ts.map