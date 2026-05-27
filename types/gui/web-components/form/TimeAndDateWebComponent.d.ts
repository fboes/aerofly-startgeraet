import { AbstractStateSubscriberWebComponent } from "../util/AbstractStateSubscriberWebComponent.js";
export type TimeAndDateWebComponentState = {
    utcDate: string;
    utcTime: string;
};
export declare class TimeAndDateWebComponent extends AbstractStateSubscriberWebComponent {
    private isInitialized;
    private elements;
    private initialize;
    get state(): TimeAndDateWebComponentState;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    private setLocalFromUtc;
    private setUtcFromLocal;
    private setNow;
    private pad;
    static registerElement(): void;
}
//# sourceMappingURL=TimeAndDateWebComponent.d.ts.map
